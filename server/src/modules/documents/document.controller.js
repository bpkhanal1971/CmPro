const path = require("path");
const fs = require("fs");
const DocumentModel = require("./document.model");
const { success, fail, error } = require("../../utils/apiResponse");

exports.list = async (req, res) => {
  try {
    const docs = await DocumentModel.findAll(req.query);
    return success(res, docs);
  } catch (err) {
    return error(res, err);
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) return fail(res, "No file uploaded");
    const { project_id, category } = req.body;
    const doc = await DocumentModel.create({
      project_id: project_id || null,
      name: req.file.originalname,
      category: category || "General",
      file_path: req.file.path,
      file_type: path.extname(req.file.originalname).replace(".", ""),
      file_size: req.file.size,
      uploaded_by: req.user.id,
    });
    return success(res, doc, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.download = async (req, res) => {
  try {
    const docs = await DocumentModel.findAll({ search: "", limit: 1, offset: 0 });
    const doc = docs.find((d) => d.id === parseInt(req.params.id));
    if (!doc) return fail(res, "Document not found", 404);
    return res.download(doc.file_path, doc.name);
  } catch (err) {
    return error(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await DocumentModel.remove(req.params.id);
    if (deleted && deleted.file_path) {
      fs.unlink(deleted.file_path, () => {});
    }
    return success(res, { message: "Document deleted" });
  } catch (err) {
    return error(res, err);
  }
};
