const { Pool } = require('pg')
require('dotenv').config()

const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123123',
        database: process.env.DB_NAME || 'pharmacy_db'
    }

const pool = new Pool({
    ...connectionConfig,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000)
})

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message)
})

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    testConnection: () => pool.query('SELECT NOW()'),
    end: () => pool.end()
}
