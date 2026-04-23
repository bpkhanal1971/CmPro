const router = require("express").Router();

router.use("/auth",      require("./modules/auth/auth.routes"));
router.use("/projects",  require("./modules/projects/project.routes"));
router.use("/tasks",     require("./modules/tasks/task.routes"));
router.use("/schedule",  require("./modules/schedule/schedule.routes"));
router.use("/risks",     require("./modules/risks/risk.routes"));
router.use("/budget",    require("./modules/budget/budget.routes"));
router.use("/documents", require("./modules/documents/document.routes"));
router.use("/reports",   require("./modules/reports/report.routes"));

module.exports = router;
