import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function FreeTrial() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
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
    if (!form.company.trim()) errs.company = "Company name is required.";
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^[\d\s\-+()]{7,}$/.test(form.phone.trim())) {
      errs.phone = "Please enter a valid phone number.";
    }
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
      const autoPassword = form.email.split("@")[0] + "Trial@1";

      const data = await signup({
        email: form.email,
        password: autoPassword,
        name: form.name,
        role: "Trial User",
        company: form.company,
        phone: form.phone,
        isTrial: true,
      });

      if (data.user && !data.session) {
        setConfirmMsg(
          "Trial account created! Please check your email to confirm, then log in with your email and the password: " +
            autoPassword
        );
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
      <div className="auth-card trial">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">CP</div>
            ConPro
          </div>
          <h1>Start Your Free Trial</h1>
          <p>
            Try ConPro free for 14 days. Explore project tracking, task
            management, team collaboration, and reporting tools built for
            construction professionals — no credit card needed.
          </p>
        </div>

        {confirmMsg ? (
          <div className="form-success">{confirmMsg}</div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError && <div className="form-error">{formError}</div>}

            <div className={`form-group ${errors.company ? "has-error" : ""}`}>
              <label htmlFor="company">Company Name</label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. Himalayan Builders Pvt. Ltd."
                value={form.company}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.company && <span className="field-error">{errors.company}</span>}
            </div>

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
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`form-group ${errors.phone ? "has-error" : ""}`}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. +977-9800000000"
                value={form.phone}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? (
                <span className="btn-loading">
                  <span className="auth-spinner-sm" /> Starting trial...
                </span>
              ) : (
                "Start Free Trial"
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
            Want full access? <Link to="/signup">Sign up</Link>
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
  if (msg.includes("already registered")) return "An account with this email already exists. Please login.";
  if (msg.includes("valid email")) return "Please enter a valid email address.";
  return msg || "Something went wrong. Please try again.";
}

export default FreeTrial;
