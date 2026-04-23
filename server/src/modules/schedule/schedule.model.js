const db = require("../../config/db");

const ScheduleModel = {
  /* ── Activities ── */
  async listActivities(project_id) {
    const { rows } = await db.query(
      `SELECT a.*, u.full_name AS assignee_name
       FROM activities a LEFT JOIN users u ON u.id = a.assigned_to
       WHERE a.project_id = $1 ORDER BY a.start_date`,
      [project_id]
    );
    return rows;
  },

  async createActivity(data) {
    const { project_id, title, start_date, end_date, assigned_to, status, dependency_id } = data;
    const { rows } = await db.query(
      `INSERT INTO activities (project_id, title, start_date, end_date, assigned_to, status, dependency_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [project_id, title, start_date, end_date, assigned_to, status || "pending", dependency_id]
    );
    return rows[0];
  },

  async updateActivity(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await db.query(`UPDATE activities SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },

  async removeActivity(id) {
    await db.query("DELETE FROM activities WHERE id = $1", [id]);
  },

  /* ── Milestones ── */
  async listMilestones(project_id) {
    const { rows } = await db.query(
      "SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date", [project_id]
    );
    return rows;
  },

  async createMilestone(data) {
    const { project_id, title, due_date } = data;
    const { rows } = await db.query(
      "INSERT INTO milestones (project_id, title, due_date) VALUES ($1,$2,$3) RETURNING *",
      [project_id, title, due_date]
    );
    return rows[0];
  },

  async removeMilestone(id) {
    await db.query("DELETE FROM milestones WHERE id = $1", [id]);
  },
};

module.exports = ScheduleModel;
