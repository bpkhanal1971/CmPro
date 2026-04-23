const db = require("../../config/db");

const AuthModel = {
  async findByEmail(email) {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async create({ full_name, email, password_hash, role, company, phone, is_trial }) {
    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, company, phone, is_trial)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, role, company, is_trial, created_at`,
      [full_name, email, password_hash, role || "client", company, phone, is_trial || false]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query(
      "SELECT id, full_name, email, role, company, phone, is_trial, is_active, created_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = AuthModel;
