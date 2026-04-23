const router = require("express").Router();
const ctrl = require("./project.controller");
const { authenticate, authorize } = require("../../middleware/auth");

router.use(authenticate);

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", authorize("admin", "project_manager"), ctrl.create);
router.put("/:id", authorize("admin", "project_manager"), ctrl.update);
router.delete("/:id", authorize("admin"), ctrl.remove);

module.exports = router;
