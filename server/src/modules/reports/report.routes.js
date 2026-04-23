const router = require("express").Router();
const ctrl = require("./report.controller");
const { authenticate } = require("../../middleware/auth");

router.use(authenticate);

router.get("/progress", ctrl.projectProgress);
router.get("/budget", ctrl.budgetOverview);
router.get("/risks", ctrl.riskSummary);
router.get("/delayed-tasks", ctrl.delayedTasks);
router.get("/safety", ctrl.safetyIncidents);

module.exports = router;
