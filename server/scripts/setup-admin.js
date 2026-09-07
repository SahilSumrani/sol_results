const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');
require('dotenv').config();

async function setupAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@sol.du.ac.in';
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!password) {
    console.error('ERROR: INITIAL_ADMIN_PASSWORD environment variable is required to setup the admin account.');
    process.exit(1);
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`Admin account (${email}) already exists.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await connection.query(
      `INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, 'ADMIN', ?)`,
      ['System Admin / Controller Exam', email, hashedPassword, 'Examination Branch']
    );
    console.log(`Successfully initialized admin account: ${email}`);
  } catch (err) {
    console.error('Failed to setup admin account:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  setupAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { setupAdmin };
