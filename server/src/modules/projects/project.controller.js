const ProjectModel = require("./project.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.list = async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;
    const projects = await ProjectModel.findAll({ status, search, limit, offset });
    return success(res, projects);
  } catch (err) {
    return error(res, err);
  }
};

exports.get = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return fail(res, "Project not found", 404);
    return success(res, project);
  } catch (err) {
    return error(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return fail(res, "Project name is required");
    const project = await ProjectModel.create({ ...req.body, created_by: req.user.id });
    return success(res, project, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const project = await ProjectModel.update(req.params.id, req.body);
    if (!project) return fail(res, "Project not found", 404);
    return success(res, project);
  } catch (err) {
    return error(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await ProjectModel.remove(req.params.id);
    return success(res, { message: "Project deleted" });
  } catch (err) {
    return error(res, err);
  }
};
