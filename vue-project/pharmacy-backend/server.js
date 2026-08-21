const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./config/db')

const app = express()
app.use(cors())
app.use(express.json())

function registerSimpleSettingRoutes(basePath, tableName, entityName) {
  app.get(basePath, async (req, res) => {
    try {
      const { rows } = await db.query(`
        SELECT id, name, description, sort_order AS "order"
        FROM ${tableName}
        ORDER BY sort_order ASC, name ASC
      `)

      res.json(rows)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server Error' })
    }
  })

  app.post(basePath, async (req, res) => {
    const { name, description, order } = req.body
    const parsedOrder = Number(order || 0)

    if (!name) {
      return res.status(400).json({ error: `${entityName} name is required` })
    }

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      return res.status(400).json({ error: 'Order must be zero or greater' })
    }

    try {
      const { rows } = await db.query(
        `
          INSERT INTO ${tableName} (name, description, sort_order)
          VALUES ($1, $2, $3)
          RETURNING id, name, description, sort_order AS "order"
        `,
        [name.trim(), description?.trim() || '', parsedOrder]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error(error)

      if (error.code === '23505') {
        return res.status(409).json({ error: `${entityName} already exists` })
      }

      res.status(500).json({ error: 'Server Error' })
    }
  })

  app.put(`${basePath}/:id`, async (req, res) => {
    const { id } = req.params
    const { name, description, order } = req.body
    const parsedOrder = Number(order || 0)

    if (!name) {
      return res.status(400).json({ error: `${entityName} name is required` })
    }

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      return res.status(400).json({ error: 'Order must be zero or greater' })
    }

    try {
      const { rows } = await db.query(
        `
          UPDATE ${tableName}
          SET name = $1,
              description = $2,
              sort_order = $3,
              updated_at = NOW()
          WHERE id = $4
          RETURNING id, name, description, sort_order AS "order"
        `,
        [name.trim(), description?.trim() || '', parsedOrder, id]
      )

      if (rows.length === 0) {
        return res.status(404).json({ error: `${entityName} not found` })
      }

      res.json(rows[0])
    } catch (error) {
      console.error(error)

      if (error.code === '23505') {
        return res.status(409).json({ error: `${entityName} already exists` })
      }

      res.status(500).json({ error: 'Server Error' })
    }
  })

  app.delete(`${basePath}/:id`, async (req, res) => {
    const { id } = req.params

    try {
      const { rowCount } = await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [id])

      if (rowCount === 0) {
        return res.status(404).json({ error: `${entityName} not found` })
      }

      res.status(204).send()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server Error' })
    }
  })
}

app.get('/api/medicines', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, barcode, name, uom
      FROM medicines
      ORDER BY id DESC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/medicines', async (req, res) => {
  const { barcode, name, uom } = req.body

  if (!barcode || !name) {
    return res.status(400).json({ error: 'Barcode and medicine name are required' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO medicines (barcode, name, uom)
        VALUES ($1, $2, $3)
        RETURNING id, barcode, name, uom
      `,
      [barcode.trim(), name.trim(), uom?.trim() || null]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Barcode already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/medicines/:id', async (req, res) => {
  const { id } = req.params
  const { barcode, name, uom } = req.body

  if (!barcode || !name) {
    return res.status(400).json({ error: 'Barcode and medicine name are required' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE medicines
        SET barcode = $1, name = $2, uom = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING id, barcode, name, uom
      `,
      [barcode.trim(), name.trim(), uom?.trim() || null, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Barcode already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.delete('/api/medicines/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rowCount } = await db.query('DELETE FROM medicines WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Medicine not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)

    if (error.code === '23503') {
      return res.status(409).json({
        error: 'This medicine is already used in inventory or prescriptions'
      })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.get('/api/inventory', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        inv.id,
        inv.medicine_id,
        m.barcode,
        m.name,
        m.uom,
        inv.stock_qty,
        inv.stock_unit,
        inv.expiry_date,
        CASE
          WHEN inv.stock_qty <= 0 THEN 'Out of Stock'
          WHEN inv.expiry_date IS NOT NULL AND inv.expiry_date < CURRENT_DATE THEN 'Expired'
          WHEN inv.expiry_date IS NOT NULL AND inv.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'Near Expiry'
          ELSE 'Normal'
        END AS status,
        CASE
          WHEN inv.stock_qty <= 0 THEN 'danger'
          WHEN inv.expiry_date IS NOT NULL AND inv.expiry_date < CURRENT_DATE THEN 'danger'
          WHEN inv.expiry_date IS NOT NULL AND inv.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'warning'
          ELSE 'normal'
        END AS status_class
      FROM inventory inv
      JOIN medicines m ON m.id = inv.medicine_id
      ORDER BY m.name ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/inventory/stock-in', async (req, res) => {
  const { medicineId, quantity, stockUnit, expiryDate } = req.body
  const parsedMedicineId = Number(medicineId)
  const parsedQuantity = Number(quantity)

  if (!Number.isInteger(parsedMedicineId) || parsedMedicineId <= 0) {
    return res.status(400).json({ error: 'Medicine is required' })
  }

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than zero' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO inventory (medicine_id, stock_qty, stock_unit, expiry_date, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (medicine_id)
        DO UPDATE SET
          stock_qty = inventory.stock_qty + EXCLUDED.stock_qty,
          stock_unit = COALESCE(EXCLUDED.stock_unit, inventory.stock_unit),
          expiry_date = COALESCE(EXCLUDED.expiry_date, inventory.expiry_date),
          updated_at = NOW()
        RETURNING id, medicine_id, stock_qty, stock_unit, expiry_date
      `,
      [parsedMedicineId, parsedQuantity, stockUnit?.trim() || null, expiryDate || null]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23503') {
      return res.status(404).json({ error: 'Medicine not found' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params
  const { stockQty, stockUnit, expiryDate } = req.body
  const parsedStockQty = Number(stockQty)

  if (!Number.isFinite(parsedStockQty)) {
    return res.status(400).json({ error: 'Stock quantity must be a valid number' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE inventory
        SET stock_qty = $1,
            stock_unit = $2,
            expiry_date = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, medicine_id, stock_qty, stock_unit, expiry_date
      `,
      [parsedStockQty, stockUnit?.trim() || null, expiryDate || null, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.get('/api/units', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, code, description, is_default, sort_order AS "order"
      FROM units
      ORDER BY sort_order ASC, name ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/units', async (req, res) => {
  const { name, code, description, isDefault, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name || !code) {
    return res.status(400).json({ error: 'Unit name and code are required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO units (name, code, description, is_default, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, code, description, is_default, sort_order AS "order"
      `,
      [name.trim(), code.trim(), description?.trim() || '', Boolean(isDefault), parsedOrder]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Unit code already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/units/:id', async (req, res) => {
  const { id } = req.params
  const { name, code, description, isDefault, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name || !code) {
    return res.status(400).json({ error: 'Unit name and code are required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE units
        SET name = $1,
            code = $2,
            description = $3,
            is_default = $4,
            sort_order = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, code, description, is_default, sort_order AS "order"
      `,
      [name.trim(), code.trim(), description?.trim() || '', Boolean(isDefault), parsedOrder, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Unit code already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.delete('/api/units/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rowCount } = await db.query('DELETE FROM units WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Unit not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.get('/api/dose-units', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, description, sort_order AS "order"
      FROM dose_units
      ORDER BY sort_order ASC, name ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/dose-units', async (req, res) => {
  const { name, description, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name) {
    return res.status(400).json({ error: 'Dose unit name is required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO dose_units (name, description, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, sort_order AS "order"
      `,
      [name.trim(), description?.trim() || '', parsedOrder]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Dose unit already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/dose-units/:id', async (req, res) => {
  const { id } = req.params
  const { name, description, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name) {
    return res.status(400).json({ error: 'Dose unit name is required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE dose_units
        SET name = $1,
            description = $2,
            sort_order = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, name, description, sort_order AS "order"
      `,
      [name.trim(), description?.trim() || '', parsedOrder, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dose unit not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Dose unit already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.delete('/api/dose-units/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rowCount } = await db.query('DELETE FROM dose_units WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Dose unit not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

registerSimpleSettingRoutes('/api/routes', 'medicine_routes', 'Route')
registerSimpleSettingRoutes('/api/forms', 'medicine_forms', 'Form')

app.get('/api/templates', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        template_no AS no,
        name,
        disease,
        type,
        description,
        sort_order AS "order"
      FROM medicine_templates
      ORDER BY sort_order ASC, template_no ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/templates', async (req, res) => {
  const { no, name, disease, type, description, order } = req.body
  const parsedOrder = Number(order || 0)
  const normalizedType = String(type || 'OPD').trim().toUpperCase()

  if (!no || !name) {
    return res.status(400).json({ error: 'Template number and name are required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  if (!['OPD', 'IPD'].includes(normalizedType)) {
    return res.status(400).json({ error: 'Template type must be OPD or IPD' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO medicine_templates (template_no, name, disease, type, description, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, template_no AS no, name, disease, type, description, sort_order AS "order"
      `,
      [
        no.trim(),
        name.trim(),
        disease?.trim() || '',
        normalizedType,
        description?.trim() || '',
        parsedOrder
      ]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Template number already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/templates/:id', async (req, res) => {
  const { id } = req.params
  const { no, name, disease, type, description, order } = req.body
  const parsedOrder = Number(order || 0)
  const normalizedType = String(type || 'OPD').trim().toUpperCase()

  if (!no || !name) {
    return res.status(400).json({ error: 'Template number and name are required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  if (!['OPD', 'IPD'].includes(normalizedType)) {
    return res.status(400).json({ error: 'Template type must be OPD or IPD' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE medicine_templates
        SET template_no = $1,
            name = $2,
            disease = $3,
            type = $4,
            description = $5,
            sort_order = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING id, template_no AS no, name, disease, type, description, sort_order AS "order"
      `,
      [
        no.trim(),
        name.trim(),
        disease?.trim() || '',
        normalizedType,
        description?.trim() || '',
        parsedOrder,
        id
      ]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Template number already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.delete('/api/templates/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rowCount } = await db.query('DELETE FROM medicine_templates WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Template not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()')

        res.json({
            success: true,
            message: 'PostgreSQL connected successfully!',
            data: result.rows
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// ១. API ទាញយកបញ្ជី Prescriptions ទាំងអស់
app.get('/api/prescriptions', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        p.id, p.code, p.patient_name, p.mrn, p.prescriber, p.status, p.pharmacist_note, p.created_at,
        COALESCE(json_agg(
          json_build_object(
            'id', pi.id,
            'barcode', m.barcode,
            'name', m.name,
            'qty', pi.qty,
            'dosage', pi.dosage,
            'instruction', pi.instruction,
            'stock', COALESCE(inv.stock_qty, 0)
          )
        ) FILTER (WHERE pi.id IS NOT NULL), '[]'::json) AS drugs
      FROM prescriptions p
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
      LEFT JOIN medicines m ON pi.medicine_id = m.id
      LEFT JOIN inventory inv ON m.id = inv.medicine_id
      GROUP BY p.id
      ORDER BY p.id DESC;
    `
    const { rows } = await db.query(queryText)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server Error' })
  }
})

// ២. API ប្រគល់ថ្នាំ និងកាត់ស្តុក (Transaction)
app.post('/api/prescriptions/:id/dispense', async (req, res) => {
  const prescriptionId = req.params.id
  const { note } = req.body
  const client = await db.getClient()

  try {
    await client.query('BEGIN')

    // ពិនិត្យមើល Prescription
    const rxRes = await client.query('SELECT status FROM prescriptions WHERE id = $1 FOR UPDATE', [prescriptionId])
    if (rxRes.rows.length === 0) throw new Error('រកមិនឃើញ Prescription នេះទេ')
    if (rxRes.rows[0].status === 'DISPENSED') throw new Error('Prescription នេះបានប្រគល់រួចហើយ')

    // ទាញយក Items
    const itemsRes = await client.query('SELECT medicine_id, qty FROM prescription_items WHERE prescription_id = $1', [prescriptionId])

    // កាត់ស្តុក
    for (const item of itemsRes.rows) {
      const stockRes = await client.query('SELECT stock_qty FROM inventory WHERE medicine_id = $1 FOR UPDATE', [item.medicine_id])
      if (stockRes.rows.length === 0 || stockRes.rows[0].stock_qty < item.qty) {
        throw new Error(`ស្តុកថ្នាំ ID ${item.medicine_id} មិនគ្រប់គ្រាន់ទេ`)
      }
      await client.query('UPDATE inventory SET stock_qty = stock_qty - $1 WHERE medicine_id = $2', [item.qty, item.medicine_id])
    }

    // Update Status
    await client.query('UPDATE prescriptions SET status = $1, pharmacist_note = $2, updated_at = NOW() WHERE id = $3', ['DISPENSED', note || '', prescriptionId])

    await client.query('COMMIT')
    res.json({ success: true, message: 'ប្រគល់ថ្នាំ និងកាត់ស្តុកជោគជ័យ' })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(400).json({ success: false, message: error.message })
  } finally {
    client.release()
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`)
})
