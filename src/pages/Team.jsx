import { useState } from "react";
import { TEAM, TASKS } from "../data/sampleData";
import { useProject } from "../context/ProjectContext";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("");
}

const ROLE_OPTIONS = ["Project Manager", "Site Engineer", "Structural Engineer", "MEP Engineer", "Site Supervisor", "QA & Safety Officer", "Cost Estimator", "Architect", "Surveyor", "Contractor"];
const AVATAR_COLORS = ["#1b5e20", "#0288d1", "#7c3aed", "#d97706", "#dc2626", "#059669", "#be185d", "#4f46e5", "#0d9488", "#9333ea"];

const emptyForm = { name: "", role: ROLE_OPTIONS[0], email: "", phone: "" };

function Team() {
  const { selectedProject } = useProject();
  const [members, setMembers] = useState(() => loadJson("conpro:team", TEAM));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useGlobalSave("conpro:team", members);

  const projectMembers = selectedProject
    ? (() => {
        const projectTasks = TASKS.filter((t) => t.project === selectedProject.name);
        const assignees = new Set(projectTasks.map((t) => t.assignee));
        return members.filter((m) => assignees.has(m.name));
      })()
    : members;

  const allRoles = [...new Set(projectMembers.map((m) => m.role))];

  const filtered = projectMembers.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    setMembers([...members, { ...form, color }]);
    setShowModal(false);
    setForm(emptyForm);
  }

  function handleDelete(email) {
    setMembers(members.filter((m) => m.email !== email));
  }

  return (
    <div>
      <div className="page-header">
        <h1>Team</h1>
        <p>Your construction team members and contacts.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--sp-4)" }}>
          Please select a project above to view its team.
        </div>
      )}

      {selectedProject && <>
      <div className="filter-bar">
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormErrors({}); setShowModal(true); }}>+ Add Member</button>
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {allRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="filter-count">{filtered.length} members</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{"\u{1F464}"}</div>
          <p>No team members match your search.</p>
        </div>
      ) : (
        <div className="team-grid">
          {filtered.map((m) => (
            <div className="team-card" key={m.email}>
              <button
                className="team-card-delete"
                onClick={() => handleDelete(m.email)}
                title="Remove member"
              >
                &times;
              </button>
              <div className="team-avatar" style={{ background: m.color }}>
                {getInitials(m.name)}
              </div>
              <h3>{m.name}</h3>
              <div className="team-role">{m.role}</div>
              <div className="team-contact">
                <p>{m.email}</p>
                <p>{m.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Hari Bahadur Tamang"
                  value={form.name}
                  onChange={handleChange}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.email ? "has-error" : ""}`}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. hari@conpro.com.np"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>
                <div className={`form-group ${formErrors.phone ? "has-error" : ""}`}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. +977-9801234567"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
