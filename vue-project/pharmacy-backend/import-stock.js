const path = require('path')
const XLSX = require('xlsx')
require('dotenv').config()

const db = require('./config/db')

const workbookPath = process.argv[2] || 'C:/Users/davy/Desktop/inventory.stock.xls'

function normalizeCell(value) {
  return String(value ?? '').trim()
}

function normalizeHeader(value) {
  return normalizeCell(value).toLowerCase()
}

function parseBalance(value) {
  const text = normalizeCell(value).replace(/,/g, '')
  const match = text.match(/^(-?\d+(?:\.\d+)?)(?:\s*(.*))?$/)

  if (!match) {
    return {
      quantity: 0,
      unit: ''
    }
  }

  return {
    quantity: Number(match[1]),
    unit: normalizeCell(match[2])
  }
}

function findHeaderRow(rows) {
  return rows.findIndex((row) => {
    const headers = row.map(normalizeHeader)
    return headers.includes('product') && headers.includes('barcode')
  })
}

function getColumnIndex(headers, name) {
  return headers.findIndex((header) => header === name)
}

async function importRows(rows, columns) {
  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const name = normalizeCell(row[columns.product])
    const barcode = normalizeCell(row[columns.barcode])
    const uom = normalizeCell(row[columns.uom])
    const balance = parseBalance(row[columns.balanceAvailable])

    if (!name || !barcode) {
      skipped += 1
      continue
    }

    const medicineResult = await db.query(
      `
        INSERT INTO medicines (barcode, name, uom, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (barcode)
        DO UPDATE SET
          name = EXCLUDED.name,
          uom = EXCLUDED.uom,
          updated_at = NOW()
        RETURNING id
      `,
      [barcode, name, uom || null]
    )

    await db.query(
      `
        INSERT INTO inventory (medicine_id, stock_qty, stock_unit, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (medicine_id)
        DO UPDATE SET
          stock_qty = EXCLUDED.stock_qty,
          stock_unit = EXCLUDED.stock_unit,
          updated_at = NOW()
      `,
      [medicineResult.rows[0].id, balance.quantity, balance.unit || null]
    )

    imported += 1
  }

  return { imported, skipped }
}

async function main() {
  const resolvedPath = path.resolve(workbookPath)
  const workbook = XLSX.readFile(resolvedPath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
  const headerRowIndex = findHeaderRow(rows)

  if (headerRowIndex === -1) {
    throw new Error('Could not find Product and Barcode columns in workbook')
  }

  const headers = rows[headerRowIndex].map(normalizeHeader)
  const columns = {
    product: getColumnIndex(headers, 'product'),
    barcode: getColumnIndex(headers, 'barcode'),
    uom: getColumnIndex(headers, 'uom'),
    balanceAvailable: getColumnIndex(headers, 'balance available')
  }

  if (columns.product === -1 || columns.barcode === -1) {
    throw new Error('Product and Barcode columns are required')
  }

  if (columns.balanceAvailable === -1) {
    columns.balanceAvailable = getColumnIndex(headers, 'balance')
  }

  const dataRows = rows.slice(headerRowIndex + 1)
  const result = await importRows(dataRows, columns)

  console.log(
    JSON.stringify({
      file: resolvedPath,
      sheet: workbook.SheetNames[0],
      ...result
    })
  )
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.end()
  })
