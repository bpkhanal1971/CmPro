const TaskModel = require("./task.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.list = async (req, res) => {
  try {
    const tasks = await TaskModel.findAll(req.query);
    return success(res, tasks);
  } catch (err) {
    return error(res, err);
  }
};

exports.get = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return fail(res, "Task not found", 404);
    return success(res, task);
  } catch (err) {
    return error(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const { project_id, title } = req.body;
    if (!project_id || !title) return fail(res, "Project and title are required");
    const task = await TaskModel.create(req.body);
    return success(res, task, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const task = await TaskModel.update(req.params.id, req.body);
    if (!task) return fail(res, "Task not found", 404);
    return success(res, task);
  } catch (err) {
    return error(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await TaskModel.remove(req.params.id);
    return success(res, { message: "Task deleted" });
  } catch (err) {
    return error(res, err);
  }
};
