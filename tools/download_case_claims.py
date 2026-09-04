#!/usr/bin/env python3
"""Download all authenticated PMRS case claims into an Excel workbook.

The browser is visible so credentials stay on the user's machine. No credentials
are saved or sent anywhere by this script.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import pandas as pd
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright

DEFAULT_URL = "https://pmrs.digitalsp.gov.kh/claims/approved/list?page=1&per_page=10&start_date=2026-06-01&end_date=2026-06-30&program_id=1&state_id=49"


def page_url(source_url: str, page_number: int, per_page: int) -> str:
    parsed = urlparse(source_url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    query["page"] = [str(page_number)]
    query["per_page"] = [str(per_page)]
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def extract_table(page) -> pd.DataFrame:
    # Prefer normal HTML tables, then support common Vue/React grid markup.
    tables = page.locator("table")
    for i in range(tables.count()):
        html = tables.nth(i).evaluate("el => el.outerHTML")
        try:
            frames = pd.read_html(html)
        except Exception:
            # Some PMRS rendered tables are not valid standalone HTML for lxml;
            # use the row/grid fallback below instead.
            continue
        if frames and len(frames[0].columns) > 1:
            return frames[0]

    rows = page.locator("tbody tr, [role='row']")
    data = []
    for i in range(rows.count()):
        cells = rows.nth(i).locator("th, td, [role='cell'], [role='gridcell']")
        values = [cells.nth(j).inner_text().strip() for j in range(cells.count())]
        if len(values) > 1:
            data.append(values)
    if data:
        width = max(map(len, data))
        data = [row + [""] * (width - len(row)) for row in data]
        return pd.DataFrame(data[1:], columns=data[0]) if len(data) > 1 else pd.DataFrame(data)
    return pd.DataFrame()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL,
                        help="Authenticated list URL; filters are preserved while paging.")
    parser.add_argument("--output", default="case_claims.xlsx")
    parser.add_argument("--per-page", type=int, default=100)
    parser.add_argument("--max-pages", type=int, default=10000)
    parser.add_argument("--headed", action="store_true", default=True,
                        help="Open a visible browser (default).")
    args = parser.parse_args()

    all_frames: list[pd.DataFrame] = []
    seen_signatures: set[str] = set()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(page_url(args.url, 1, args.per_page), wait_until="domcontentloaded")
        print("A browser window is open. Sign in to PMRS, then return here and press Enter.")
        input()

        for number in range(1, args.max_pages + 1):
            target = page_url(args.url, number, args.per_page)
            page.goto(target, wait_until="domcontentloaded")
            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except PlaywrightTimeoutError:
                pass
            if "/login" in page.url.lower():
                raise RuntimeError("The PMRS session expired or login was unsuccessful.")

            frame = extract_table(page)
            if frame.empty:
                print(f"No table found on page {number}; stopping.")
                break
            # Keep column labels stable across rendered pages.
            frame.columns = [f"Column_{i + 1}" for i in range(len(frame.columns))]
            signature = re.sub(r"\s+", " ", frame.to_csv(index=False))
            if signature in seen_signatures:
                print(f"Page {number} repeated an earlier page; stopping.")
                break
            seen_signatures.add(signature)
            all_frames.append(frame)
            print(f"Downloaded page {number}: {len(frame)} rows")
            # Do not stop based on row count: some grids include a header row
            # or render fewer rows than requested even when more pages exist.

        browser.close()

    if not all_frames:
        raise RuntimeError("No records were downloaded. Check the login and table layout.")
    result = pd.concat(all_frames, ignore_index=True)
    output = Path(args.output)
    result.to_excel(output, index=False, engine="openpyxl")
    print(f"Saved {len(result)} records to {output.resolve()}")


if __name__ == "__main__":
    main()
