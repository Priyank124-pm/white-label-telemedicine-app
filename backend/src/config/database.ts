import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'doctor_saas',
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  timezone:           'Z',
  charset:            'utf8mb4',
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await pool.query(sql, params as any);
  return rows as T;
}
