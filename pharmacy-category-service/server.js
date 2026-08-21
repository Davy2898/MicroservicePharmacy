const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./config/db')

const app = express()
app.use(cors())
app.use(express.json())

// Category routes
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, description, sort_order AS "order"
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

app.post('/api/categories', async (req, res) => {
  const { name, description, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        INSERT INTO categories (name, description, sort_order)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, sort_order AS "order"
      `,
      [name.trim(), description?.trim() || '', parsedOrder]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params
  const { name, description, order } = req.body
  const parsedOrder = Number(order || 0)

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
    return res.status(400).json({ error: 'Order must be zero or greater' })
  }

  try {
    const { rows } = await db.query(
      `
        UPDATE categories
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
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists' })
    }

    res.status(500).json({ error: 'Server Error' })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rowCount } = await db.query('DELETE FROM categories WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()')
    res.json({
      success: true,
      message: 'Category service is healthy',
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

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`🚀 Category Service running on port ${PORT}`)
})
