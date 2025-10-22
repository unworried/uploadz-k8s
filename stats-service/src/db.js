import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || "postgres",
    port: 5432,
    database: process.env.DB_NAME || "images_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
});

export default pool;