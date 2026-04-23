const RiskModel = require("./risk.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.list = async (req, res) => {
  try {
    const risks = await RiskModel.findAll(req.query);
    return success(res, risks);
  } catch (err) {
    return error(res, err);
  }
};

exports.get = async (req, res) => {
  try {
    const risk = await RiskModel.findById(req.params.id);
    if (!risk) return fail(res, "Risk not found", 404);
    return success(res, risk);
  } catch (err) {
    return error(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, title, probability, impact } = req.body;
    if (!project_id || !title || !probability || !impact) {
      return fail(res, "Project, title, probability and impact are required");
    }
    const risk = await RiskModel.create(req.body);
    return success(res, risk, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const risk = await RiskModel.update(req.params.id, req.body);
    if (!risk) return fail(res, "Risk not found", 404);
    return success(res, risk);
  } catch (err) {
    return error(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await RiskModel.remove(req.params.id);
    return success(res, { message: "Risk deleted" });
  } catch (err) {
    return error(res, err);
  }
};
