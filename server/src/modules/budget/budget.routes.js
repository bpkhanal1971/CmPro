const router = require("express").Router();
const ctrl = require("./budget.controller");
const { authenticate } = require("../../middleware/auth");

router.use(authenticate);

router.get("/", ctrl.list);
router.get("/summary", ctrl.summary);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
