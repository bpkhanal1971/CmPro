const db = require("../../config/db");

const TaskModel = {
  async findAll({ project_id, status, priority, search, limit = 50, offset = 0 }) {
    let query = `
      SELECT t.*, u.full_name AS assignee_name, p.name AS project_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (project_id) { query += ` AND t.project_id = $${idx++}`; params.push(project_id); }
    if (status)     { query += ` AND t.status = $${idx++}`;     params.push(status); }
    if (priority)   { query += ` AND t.priority = $${idx++}`;   params.push(priority); }
    if (search)     { query += ` AND t.title ILIKE $${idx++}`;  params.push(`%${search}%`); }

    query += ` ORDER BY t.deadline ASC NULLS LAST LIMIT $${idx++} OFFSET $${idx}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT t.*, u.full_name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assigned_to WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { project_id, title, description, assigned_to, priority, status, deadline } = data;
    const { rows } = await db.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, priority, status, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [project_id, title, description, assigned_to, priority || "medium", status || "pending", deadline]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return this.findById(id);
    params.push(id);
    const { rows } = await db.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },

  async remove(id) {
    await db.query("DELETE FROM tasks WHERE id = $1", [id]);
  },
};

module.exports = TaskModel;
