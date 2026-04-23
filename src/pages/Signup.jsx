import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (formError) setFormError("");
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email.";
    }
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Must be at least 6 characters.";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    if (!form.role) errs.role = "Please select a role.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setConfirmMsg("");

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const data = await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
      });

      if (data.user && !data.session) {
        setConfirmMsg("Account created! Please check your email to confirm before logging in.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setFormError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card signup">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">CP</div>
            ConPro
          </div>
          <h1>Create Account</h1>
          <p>Join ConPro to manage your construction projects</p>
        </div>

        {confirmMsg ? (
          <div className="form-success">{confirmMsg}</div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError && <div className="form-error">{formError}</div>}

            <div className={`form-group ${errors.name ? "has-error" : ""}`}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Ramesh Sharma"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className={`form-group ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.password ? "has-error" : ""}`}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className={`form-group ${errors.confirmPassword ? "has-error" : ""}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className={`form-group ${errors.role ? "has-error" : ""}`}>
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={form.role} onChange={handleChange} disabled={submitting}>
                <option value="" disabled>Select your role...</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Contractor">Contractor</option>
                <option value="Client">Client</option>
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? (
                <span className="btn-loading">
                  <span className="auth-spinner-sm" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p style={{ marginTop: 6 }}>
            Try it first with a <Link to="/free-trial">Free Trial</Link>
          </p>
        </div>

        <Link to="/" className="auth-home-btn">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

function friendlyError(msg) {
  if (msg.includes("already registered")) return "An account with this email already exists.";
  if (msg.includes("valid email")) return "Please enter a valid email address.";
  if (msg.includes("at least")) return "Password must be at least 6 characters.";
  return msg || "Something went wrong. Please try again.";
}

export default Signup;
