function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

function error(res, err) {
  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = { success, fail, error };
