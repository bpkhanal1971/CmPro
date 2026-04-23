const db = require("../../config/db");

const ProjectModel = {
  async findAll({ status, search, limit = 50, offset = 0 }) {
    let query = "SELECT * FROM projects WHERE 1=1";
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND status = $${idx++}`;
      params.push(status);
    }
    if (search) {
      query += ` AND (name ILIKE $${idx} OR client ILIKE $${idx} OR location ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query("SELECT * FROM projects WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { name, client, location, description, start_date, end_date, status, budget, created_by } = data;
    const { rows } = await db.query(
      `INSERT INTO projects (name, client, location, description, start_date, end_date, status, budget, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [name, client, location, description, start_date, end_date, status || "planning", budget || 0, created_by]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        params.push(val);
      }
    }
    if (!fields.length) return this.findById(id);

    params.push(id);
    const { rows } = await db.query(
      `UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0];
  },

  async remove(id) {
    await db.query("DELETE FROM projects WHERE id = $1", [id]);
  },
};

module.exports = ProjectModel;
