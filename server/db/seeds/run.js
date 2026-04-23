const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash("password123", 10);

    await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, company)
      VALUES
        ('Admin User',    'admin@conpro.com',    $1, 'admin',           'ConPro HQ'),
        ('Ramesh Sharma', 'ramesh@conpro.com',   $1, 'project_manager', 'BuildRight Pvt.'),
        ('Sita Gurung',   'sita@conpro.com',     $1, 'site_engineer',   'BuildRight Pvt.'),
        ('Bikash Thapa',  'bikash@conpro.com',   $1, 'contractor',      'ThapaCon'),
        ('Anita KC',      'anita@conpro.com',    $1, 'client',          'KC Enterprises')
      ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    await client.query(`
      INSERT INTO projects (name, client, location, description, start_date, end_date, status, progress, budget, created_by)
      VALUES
        ('Riverside Tower',      'KC Enterprises', 'Kathmandu',   'High-rise residential',    '2026-01-15', '2027-06-30', 'in_progress', 65, 42000000, 2),
        ('Greenfield Mall',      'Sunrise Group',  'Lalitpur',    'Commercial shopping mall',  '2026-03-01', '2027-12-31', 'in_progress', 40, 85000000, 2),
        ('Harbor Bridge Repair', 'DoR Nepal',      'Pokhara',     'Bridge rehabilitation',     '2026-04-01', '2026-10-31', 'planning',    15, 21000000, 2),
        ('Metro Line Extension', 'Nepal Metro',    'Bhaktapur',   'Metro rail extension',      '2025-11-01', '2028-03-31', 'in_progress', 30, 150000000, 2),
        ('Hilltop Resort',       'KC Enterprises', 'Nagarkot',    'Luxury resort build',       '2026-02-15', '2027-09-30', 'in_progress', 22, 55000000, 2)
      ON CONFLICT DO NOTHING;
    `);

    console.log("Seed complete — sample users and projects inserted.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
