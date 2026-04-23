const ScheduleModel = require("./schedule.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.listActivities = async (req, res) => {
  try {
    const rows = await ScheduleModel.listActivities(req.params.projectId);
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;
    if (!title || !start_date || !end_date) return fail(res, "Title, start and end dates are required");
    const activity = await ScheduleModel.createActivity({ ...req.body, project_id: req.params.projectId });
    return success(res, activity, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await ScheduleModel.updateActivity(req.params.id, req.body);
    if (!activity) return fail(res, "Activity not found", 404);
    return success(res, activity);
  } catch (err) {
    return error(res, err);
  }
};

exports.removeActivity = async (req, res) => {
  try {
    await ScheduleModel.removeActivity(req.params.id);
    return success(res, { message: "Activity deleted" });
  } catch (err) {
    return error(res, err);
  }
};

exports.listMilestones = async (req, res) => {
  try {
    const rows = await ScheduleModel.listMilestones(req.params.projectId);
    return success(res, rows);
  } catch (err) {
    return error(res, err);
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const { title, due_date } = req.body;
    if (!title || !due_date) return fail(res, "Title and due date are required");
    const ms = await ScheduleModel.createMilestone({ ...req.body, project_id: req.params.projectId });
    return success(res, ms, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.removeMilestone = async (req, res) => {
  try {
    await ScheduleModel.removeMilestone(req.params.id);
    return success(res, { message: "Milestone deleted" });
  } catch (err) {
    return error(res, err);
  }
};
