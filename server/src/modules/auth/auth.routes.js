const router = require("express").Router();
const ctrl = require("./auth.controller");
const { authenticate } = require("../../middleware/auth");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/free-trial", ctrl.freeTrial);
router.get("/me", authenticate, ctrl.me);

module.exports = router;
