const db = require("../../config/db");

const BudgetModel = {
  async listByProject(project_id) {
    const { rows } = await db.query(
      "SELECT * FROM expenses WHERE project_id = $1 ORDER BY date DESC", [project_id]
    );
    return rows;
  },

  async summary(project_id) {
    const { rows } = await db.query(
      `SELECT
         COALESCE(SUM(planned_cost), 0)  AS total_planned,
         COALESCE(SUM(actual_cost), 0)   AS total_actual,
         COUNT(*)                         AS entry_count
       FROM expenses WHERE project_id = $1`,
      [project_id]
    );
    return rows[0];
  },

  async create(data) {
    const { project_id, category, planned_cost, actual_cost, description, date } = data;
    const { rows } = await db.query(
      `INSERT INTO expenses (project_id, category, planned_cost, actual_cost, description, date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [project_id, category, planned_cost || 0, actual_cost || 0, description, date]
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
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await db.query(`UPDATE expenses SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },

  async remove(id) {
    await db.query("DELETE FROM expenses WHERE id = $1", [id]);
  },
};

module.exports = BudgetModel;
