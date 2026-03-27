const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.POSTGRES_HOST     || 'postgres',
  port:     parseInt(process.env.POSTGRES_PORT || '5432'),
  user:     process.env.POSTGRES_USER     || 'appuser',
  password: process.env.POSTGRES_PASSWORD || 'securepassword123',
  database: process.env.POSTGRES_DB       || 'appdb',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
