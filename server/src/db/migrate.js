const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigrations() {
  console.log('Running database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const connection = await pool.getConnection();
  try {
    // Create migrations tracker table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [rows] = await connection.query(`SELECT name FROM _schema_migrations`);
    const executed = new Set(rows.map(r => r.name));

    for (const file of files) {
      if (!executed.has(file)) {
        console.log(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        try {
          await connection.query(sql);
        } catch (mErr) {
          if (mErr.code === 'ER_DUP_FIELDNAME' || mErr.errno === 1060) {
            console.log(`Columns in ${file} already exist, skipping.`);
          } else {
            throw mErr;
          }
        }
        await connection.query(`INSERT INTO _schema_migrations (name) VALUES (?)`, [file]);
        console.log(`Successfully executed migration: ${file}`);
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }
    console.log('All migrations executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
