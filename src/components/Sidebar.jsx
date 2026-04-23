import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../context/AuthContext";

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { to: "/projects", label: "Projects", icon: "\u{1F3D7}" },
  { to: "/schedule", label: "Schedule", icon: "\u{1F4C5}" },
  { to: "/tasks", label: "Tasks", icon: "\u2705" },
  { to: "/budget", label: "Budget", icon: "\u{1F4B0}" },
  { to: "/risk-management", label: "Risk Management", icon: "\u26A0\uFE0F" },
  { to: "/documents", label: "Documents", icon: "\u{1F4C1}" },
  { to: "/reports", label: "Reports", icon: "\u{1F4C8}" },
  { to: "/team", label: "Team", icon: "\u{1F465}" },
  { to: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

function Sidebar() {
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { selectedProject, clearProject } = useProject();
  const { user } = useAuth();

  function handleSidebarSave() {
    window.dispatchEvent(new Event("conpro:save"));
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  }

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {selectedProject && (
          <div className="sidebar-project-badge" title={selectedProject.name}>
            <span className="sidebar-project-name">{selectedProject.name}</span>
            <button className="sidebar-project-clear" onClick={clearProject}>&times;</button>
          </div>
        )}
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <span className="icon">📊</span>
            Dashboard
          </NavLink>

          {user && (
            <div className="sidebar-save-wrap">
              <button
                className="btn btn-primary btn-sm sidebar-save-btn"
                onClick={handleSidebarSave}
                type="button"
              >
                {justSaved ? "SAVED" : "SAVE"}
              </button>
            </div>
          )}

          {mainLinks
            .filter((l) => l.to !== "/dashboard")
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? "\u2715" : "\u2630"}
      </button>
    </>
  );
}

export default Sidebar;
