import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (formError) setFormError("");
  }

  function validate() {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setFormError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">CP</div>
            ConPro
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {formError && <div className="form-error">{formError}</div>}

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
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className={`form-group ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? (
              <span className="btn-loading">
                <span className="auth-spinner-sm" /> Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p style={{ marginTop: 6 }}>
            Or start a <Link to="/free-trial">Free Trial</Link>
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
  if (msg.includes("Invalid login")) return "Invalid email or password.";
  if (msg.includes("Email not confirmed")) return "Please check your email and confirm your account first.";
  if (msg.includes("Too many requests")) return "Too many attempts. Please wait a moment and try again.";
  return msg || "Something went wrong. Please try again.";
}

export default Login;
