const Pool = require('pg').Pool;

const pool = new Pool({
    database: process.env.PGDATABASE || 'Inventory_management'
});

module.exports = pool;