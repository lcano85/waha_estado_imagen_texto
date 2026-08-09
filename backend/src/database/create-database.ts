import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

async function createDatabase() {
  const database = process.env.DB_NAME || 'terranova_estados_waha';
  if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('DB_NAME contiene caracteres no permitidos');
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();
  console.log(`Base de datos ${database} lista.`);
}
createDatabase().catch(error => { console.error(error); process.exit(1); });
