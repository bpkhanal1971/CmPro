import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function handleGlobalSave() {
    window.dispatchEvent(new Event("conpro:save"));
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  }

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="navbar-brand">
          <div className="brand-icon">CP</div>
          <span>ConPro</span>
        </div>
        <Link to="/" className="navbar-home-btn" title="Back to Home">
          &#8962; Home
        </Link>
      </div>

      <div className="navbar-actions">
        <div className="navbar-search">
          <span>&#128269;</span>
          <input type="text" placeholder="Search projects..." />
        </div>

        {user && (
          <button className="btn btn-primary btn-sm" onClick={handleGlobalSave} type="button">
            {justSaved ? "SAVED" : "SAVE"}
          </button>
        )}

        {user && (
          <div className="navbar-user-info">
            <div className="navbar-avatar" title={user.name}>
              {getInitials(user.name)}
            </div>
            <div className="navbar-user-meta">
              <span className="navbar-user-name">{user.name}</span>
              <span className="navbar-user-plan">
                {user.plan === "trial" ? "Free Trial" : "Standard"}
              </span>
            </div>
            <button
              className="navbar-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
