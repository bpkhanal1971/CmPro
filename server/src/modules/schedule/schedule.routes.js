const router = require("express").Router();
const ctrl = require("./schedule.controller");
const { authenticate } = require("../../middleware/auth");

router.use(authenticate);

router.get("/:projectId/activities", ctrl.listActivities);
router.post("/:projectId/activities", ctrl.createActivity);
router.put("/activities/:id", ctrl.updateActivity);
router.delete("/activities/:id", ctrl.removeActivity);

router.get("/:projectId/milestones", ctrl.listMilestones);
router.post("/:projectId/milestones", ctrl.createMilestone);
router.delete("/milestones/:id", ctrl.removeMilestone);

module.exports = router;
