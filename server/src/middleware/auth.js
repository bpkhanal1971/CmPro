const jwt = require("jsonwebtoken");
const { fail } = require("../utils/apiResponse");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, "Authentication required", 401);
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return fail(res, "Invalid or expired token", 401);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return fail(res, "Insufficient permissions", 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
