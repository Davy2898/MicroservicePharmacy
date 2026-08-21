const { Pool } = require('pg')
require('dotenv').config()

const databaseName = process.env.DB_NAME

if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME must contain only letters, numbers, and underscores')
}

const baseConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

const createDatabase = async () => {
  const pool = new Pool({
    ...baseConfig,
    database: 'postgres'
  })

  try {
    const result = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName])

    if (result.rowCount === 0) {
      await pool.query(`CREATE DATABASE ${databaseName}`)
      console.log(`Created database ${databaseName}`)
    } else {
      console.log(`Database ${databaseName} already exists`)
    }
  } finally {
    await pool.end()
  }
}

const createTables = async () => {
  const pool = new Pool({
    ...baseConfig,
    database: databaseName
  })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id SERIAL PRIMARY KEY,
        barcode VARCHAR(80) NOT NULL UNIQUE,
        name TEXT NOT NULL,
        uom TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query('ALTER TABLE medicines ADD COLUMN IF NOT EXISTS uom TEXT')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        medicine_id INTEGER NOT NULL UNIQUE REFERENCES medicines(id) ON DELETE RESTRICT,
        stock_qty NUMERIC(14, 2) NOT NULL DEFAULT 0,
        stock_unit TEXT,
        expiry_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query('ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_stock_qty_check')
    await pool.query('ALTER TABLE inventory ADD COLUMN IF NOT EXISTS stock_unit TEXT')
    await pool.query(`
      ALTER TABLE inventory
      ALTER COLUMN stock_qty TYPE NUMERIC(14, 2)
      USING stock_qty::numeric
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO categories (name, description, sort_order)
      VALUES
        ('Syrup', '', 1),
        ('Blist', '', 2),
        ('Bottle', '', 3),
        ('Injection', '', 4),
        ('BOX', '', 5),
        ('CAP', '', 6)
      ON CONFLICT (name) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO units (name, code, description, is_default, sort_order)
      VALUES
        ('Sac', 'Sac', '', FALSE, 1),
        ('L', 'L', '', FALSE, 2),
        ('PCS', 'PCS', '', FALSE, 3),
        ('បន្ទះ', 'បន្ទះ', '', FALSE, 4),
        ('Sache', 'Sache', '', FALSE, 5),
        ('ទីប', 'ទីប', '', FALSE, 6),
        ('OVUL', 'OVUL', '', FALSE, 7),
        ('អំពូល', 'អំពូល', '', FALSE, 8),
        ('ដប', 'ដប', '', FALSE, 9),
        ('កញ្ចប់', 'កញ្ចប់', '', FALSE, 10),
        ('គ្រាប់', 'គ្រាប់', '', FALSE, 11)
      ON CONFLICT (code) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dose_units (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO dose_units (name, description, sort_order)
      VALUES
        ('Sac', '', 1),
        ('IU', '', 2),
        ('L', '', 3),
        ('PCS', '', 4),
        ('បន្ទះ', '', 5),
        ('Sache', '', 6),
        ('ទីប', '', 7),
        ('mg', '', 8),
        ('OVUL', '', 9),
        ('អំពូល', '', 10),
        ('ដប', '', 11),
        ('ml', '', 12),
        ('កញ្ចប់', '', 13),
        ('គ្រាប់', '', 14)
      ON CONFLICT (name) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicine_routes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO medicine_routes (name, description, sort_order)
      VALUES
        ('Oral / PO', '', 1),
        ('IV (Intravenous)', '', 2),
        ('IM (Intramuscular)', '', 3),
        ('Subcutaneous', '', 4),
        ('Topical', '', 5),
        ('Eye Drops', '', 6),
        ('Ear Drops', '', 7),
        ('Nasal Spray', '', 8)
      ON CONFLICT (name) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicine_forms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO medicine_forms (name, description, sort_order)
      VALUES
        ('Tablet', '', 1),
        ('Capsule', '', 2),
        ('Syrup', '', 3),
        ('Suspension', '', 4),
        ('Injection', '', 5),
        ('Cream / Ointment', '', 6),
        ('Solution', '', 7),
        ('Suppository', '', 8)
      ON CONFLICT (name) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicine_templates (
        id SERIAL PRIMARY KEY,
        template_no TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        disease TEXT,
        type TEXT NOT NULL DEFAULT 'OPD',
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await pool.query(`
      INSERT INTO medicine_templates (template_no, name, disease, type, description, sort_order)
      VALUES
        ('01', 'DM 7 days', '', 'OPD', '', 1),
        ('02', 'DM 30 days', '', 'OPD', '', 2),
        ('03', 'DM 15 days', '', 'OPD', '', 3),
        ('04', 'HTA 7 days', '', 'OPD', '', 4),
        ('05', 'HTA 15 days', '', 'OPD', '', 5),
        ('06', 'HTA 30 days', '', 'OPD', '', 6),
        ('10', 'Acute Appendicitis', '', 'IPD', '', 7),
        ('14', 'C-Section', '', 'IPD', '', 8)
      ON CONFLICT (template_no) DO NOTHING
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        patient_name TEXT NOT NULL,
        mrn TEXT,
        prescriber TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        pharmacist_note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT prescriptions_status_check CHECK (status IN ('PENDING', 'DISPENSED'))
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescription_items (
        id SERIAL PRIMARY KEY,
        prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
        qty NUMERIC(14, 2) NOT NULL CHECK (qty > 0),
        dosage TEXT,
        instruction TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    console.log('Medicines table is ready')
    console.log('Inventory table is ready')
    console.log('Categories table is ready')
    console.log('Units table is ready')
    console.log('Dose units table is ready')
    console.log('Routes table is ready')
    console.log('Forms table is ready')
    console.log('Templates table is ready')
    console.log('Prescriptions table is ready')
    console.log('Prescription items table is ready')
  } finally {
    await pool.end()
  }
}

const main = async () => {
  await createDatabase()
  await createTables()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
