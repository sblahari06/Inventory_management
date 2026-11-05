const Pool = require('pg').Pool;

const connectionConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || 'Inventory_management',
    };

if (process.env.PGSSLMODE === 'require') {
    connectionConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(connectionConfig);

module.exports = pool;