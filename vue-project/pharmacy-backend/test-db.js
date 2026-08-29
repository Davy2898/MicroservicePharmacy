const db = require('./config/db')

function describeTarget() {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      return `${url.hostname}:${url.port || 5432}/${url.pathname.replace(/^\//, '')}`
    } catch {
      return 'DATABASE_URL'
    }
  }

  const host = process.env.DB_HOST || 'localhost'
  const port = process.env.DB_PORT || 5432
  const database = process.env.DB_NAME || 'pharmacy_db'

  return `${host}:${port}/${database}`
}

async function main() {
  try {
    const result = await db.testConnection()
    const now = result.rows[0]?.now

    console.log(`Database connected: ${describeTarget()}`)
    if (now) {
      console.log(`Database time: ${now.toISOString ? now.toISOString() : now}`)
    }
  } catch (error) {
    console.error(`Database connection failed: ${describeTarget()}`)
    console.error(error.message)
    process.exitCode = 1
  } finally {
    await db.end()
  }
}

main()
