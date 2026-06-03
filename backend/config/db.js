import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

function convertPlaceholders(sql) {
  let index = 0
  return sql.replace(/\?/g, () => `$${++index}`)
}

function addReturningId(sql) {
  const trimmed = sql.trim()
  if (!/^insert\s+/i.test(trimmed) || /\breturning\b/i.test(trimmed)) {
    return sql
  }

  return `${sql} RETURNING id`
}

function createMysqlCompatibleResult(result, sql) {
  const trimmed = sql.trim()
  const command = result.command?.toUpperCase()

  if (command === 'SELECT' || trimmed.toLowerCase().startsWith('with ')) {
    return [result.rows]
  }

  const packet = {
    affectedRows: result.rowCount || 0,
    insertId: result.rows?.[0]?.id
  }

  return [packet]
}

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  host: process.env.PGHOST || process.env.DB_HOST,
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  database: process.env.PGDATABASE || process.env.DB_NAME,
  ssl: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
    ? { rejectUnauthorized: false }
    : false,
  max: 10
})

export const pool = {
  async query(sql, params = []) {
    const preparedSql = convertPlaceholders(addReturningId(sql))
    const result = await pgPool.query(preparedSql, params)
    return createMysqlCompatibleResult(result, preparedSql)
  },

  async execute(sql, params = []) {
    return this.query(sql, params)
  }
}
