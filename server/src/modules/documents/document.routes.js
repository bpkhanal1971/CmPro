const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const ctrl = require("./document.controller");
const { authenticate } = require("../../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || "uploads";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

router.use(authenticate);

router.get("/", ctrl.list);
router.post("/", upload.single("file"), ctrl.upload);
router.get("/:id/download", ctrl.download);
router.delete("/:id", ctrl.remove);

module.exports = router;
