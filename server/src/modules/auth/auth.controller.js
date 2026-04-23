const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("./auth.model");
const { success, fail, error } = require("../../utils/apiResponse");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, company, phone } = req.body;

    if (!full_name || !email || !password) {
      return fail(res, "Full name, email, and password are required");
    }

    const existing = await AuthModel.findByEmail(email);
    if (existing) return fail(res, "Email already registered", 409);

    const password_hash = await bcrypt.hash(password, 10);
    const user = await AuthModel.create({ full_name, email, password_hash, role, company, phone });
    const token = signToken(user);

    return success(res, { user, token }, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, "Email and password are required");

    const user = await AuthModel.findByEmail(email);
    if (!user) return fail(res, "Invalid credentials", 401);
    if (!user.is_active) return fail(res, "Account deactivated", 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return fail(res, "Invalid credentials", 401);

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    return success(res, { user: safeUser, token });
  } catch (err) {
    return error(res, err);
  }
};

exports.freeTrial = async (req, res) => {
  try {
    const { full_name, email, company, phone } = req.body;
    if (!full_name || !email) return fail(res, "Full name and email are required");

    const existing = await AuthModel.findByEmail(email);
    if (existing) return fail(res, "Email already registered", 409);

    const tempPassword = email.split("@")[0] + "123";
    const password_hash = await bcrypt.hash(tempPassword, 10);
    const user = await AuthModel.create({
      full_name, email, password_hash, role: "client", company, phone, is_trial: true,
    });
    const token = signToken(user);

    return success(res, { user, token, temp_password: tempPassword }, 201);
  } catch (err) {
    return error(res, err);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.user.id);
    if (!user) return fail(res, "User not found", 404);
    return success(res, user);
  } catch (err) {
    return error(res, err);
  }
};
