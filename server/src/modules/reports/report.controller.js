const db = require("../../config/db");
const { success, error } = require("../../utils/apiResponse");

exports.projectProgress = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, status, progress, start_date, end_date FROM projects ORDER BY name"
    );
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};

exports.budgetOverview = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.id, p.name, p.budget AS allocated,
             COALESCE(SUM(e.actual_cost), 0) AS spent
      FROM projects p
      LEFT JOIN expenses e ON e.project_id = p.id
      GROUP BY p.id ORDER BY p.name
    `);
    const data = rows.map((r) => ({
      ...r,
      allocated: Number(r.allocated),
      spent: Number(r.spent),
      remaining: Number(r.allocated) - Number(r.spent),
    }));
    return success(res, data);
  } catch (err) {
    return error(res, err);
  }
};

exports.riskSummary = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE risk_score >= 20)              AS critical,
        COUNT(*) FILTER (WHERE risk_score BETWEEN 12 AND 19)  AS high,
        COUNT(*) FILTER (WHERE risk_score BETWEEN 5 AND 11)   AS medium,
        COUNT(*) FILTER (WHERE risk_score < 5)                AS low,
        COUNT(*)                                              AS total
      FROM risks
    `);
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err);
  }
};

exports.delayedTasks = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT t.id, t.title, t.deadline, t.status, p.name AS project_name,
             u.full_name AS assignee_name,
             (CURRENT_DATE - t.deadline) AS days_late
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.deadline < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY days_late DESC
    `);
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};

exports.safetyIncidents = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT si.*, p.name AS project_name, u.full_name AS reporter_name
      FROM safety_incidents si
      LEFT JOIN projects p ON p.id = si.project_id
      LEFT JOIN users u ON u.id = si.reported_by
      ORDER BY si.incident_date DESC
    `);
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};
