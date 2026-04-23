const db = require("../../config/db");
const { calcRiskScore } = require("../../utils/riskScore");

const RiskModel = {
  async findAll({ project_id, status, limit = 50, offset = 0 }) {
    let query = `
      SELECT r.*, u.full_name AS owner_name, p.name AS project_name
      FROM risks r
      LEFT JOIN users u ON u.id = r.owner_id
      LEFT JOIN projects p ON p.id = r.project_id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (project_id) { query += ` AND r.project_id = $${idx++}`; params.push(project_id); }
    if (status)     { query += ` AND r.status = $${idx++}`;     params.push(status); }

    query += ` ORDER BY r.risk_score DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query("SELECT * FROM risks WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { project_id, title, description, probability, impact, mitigation_plan, owner_id, status } = data;
    const risk_score = calcRiskScore(probability, impact);
    const { rows } = await db.query(
      `INSERT INTO risks (project_id, title, description, probability, impact, risk_score, mitigation_plan, owner_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [project_id, title, description, probability, impact, risk_score, mitigation_plan, owner_id, status || "open"]
    );
    return rows[0];
  },

  async update(id, data) {
    if (data.probability && data.impact) {
      data.risk_score = calcRiskScore(data.probability, data.impact);
    }
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return this.findById(id);
    params.push(id);
    const { rows } = await db.query(`UPDATE risks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },

  async remove(id) {
    await db.query("DELETE FROM risks WHERE id = $1", [id]);
  },
};

module.exports = RiskModel;
