const BudgetModel = require("./budget.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.list = async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) return fail(res, "project_id query param is required");
    const rows = await BudgetModel.listByProject(project_id);
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};

exports.summary = async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) return fail(res, "project_id query param is required");
    const data = await BudgetModel.summary(project_id);
    return success(res, data);
  } catch (err) {
    return error(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, category } = req.body;
    if (!project_id || !category) return fail(res, "Project and category are required");
    const expense = await BudgetModel.create(req.body);
    return success(res, expense, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await BudgetModel.update(req.params.id, req.body);
    if (!expense) return fail(res, "Expense not found", 404);
    return success(res, expense);
  } catch (err) {
    return error(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await BudgetModel.remove(req.params.id);
    return success(res, { message: "Expense deleted" });
  } catch (err) {
    return error(res, err);
  }
};
