const { Pool } = require('pg');
require('dotenv').config({ path: '/media/becky/fbb95933-6bf3-476c-ad04-81ce8356b618/yenege/zion-website/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
