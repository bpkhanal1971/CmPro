const db = require("../../config/db");

const DocumentModel = {
  async findAll({ project_id, category, search, limit = 50, offset = 0 }) {
    let query = "SELECT d.*, u.full_name AS uploader_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by WHERE 1=1";
    const params = [];
    let idx = 1;

    if (project_id) { query += ` AND d.project_id = $${idx++}`; params.push(project_id); }
    if (category)   { query += ` AND d.category = $${idx++}`;   params.push(category); }
    if (search)     { query += ` AND d.name ILIKE $${idx++}`;   params.push(`%${search}%`); }

    query += ` ORDER BY d.created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  },

  async create(data) {
    const { project_id, name, category, file_path, file_type, file_size, uploaded_by } = data;
    const { rows } = await db.query(
      `INSERT INTO documents (project_id, name, category, file_path, file_type, file_size, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [project_id, name, category || "General", file_path, file_type, file_size, uploaded_by]
    );
    return rows[0];
  },

  async remove(id) {
    const { rows } = await db.query("DELETE FROM documents WHERE id = $1 RETURNING file_path", [id]);
    return rows[0];
  },
};

module.exports = DocumentModel;
