import { useState } from "react";
import { PROJECTS } from "../data/sampleData";
import { useSettings } from "../context/SettingsContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import NepaliDatePicker from "../components/NepaliDatePicker";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";

const STATUSES = ["Planning", "In Progress", "On Hold", "Completed"];
const LOCATIONS = ["Kathmandu", "Pokhara", "Bharatpur", "Chitwan", "Biratnagar", "Lalitpur", "Bhaktapur", "Butwal", "Dharan", "Nepalgunj"];

const emptyForm = {
  name: "",
  client: "",
  location: LOCATIONS[0],
  start: "",
  end: "",
  budget: "",
  status: "Planning",
  progress: 0,
};

function getStatusBadge(status) {
  return { "In Progress": "badge-green", Planning: "badge-amber", "On Hold": "badge-gray", Completed: "badge-blue" }[status] || "badge-gray";
}

function getProgressColor(progress) {
  if (progress >= 70) return "green";
  if (progress >= 40) return "blue";
  return "amber";
}

function fmt(n) {
  return "\u0930\u0942 " + Number(n).toLocaleString("en-IN");
}

function Projects() {
  const { settings } = useSettings();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat);
  const [projects, setProjects] = useState(() => loadJson("conpro:projects", PROJECTS));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useGlobalSave("conpro:projects", projects);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      p.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      client: project.client,
      location: project.location,
      start: project.start,
      end: project.end,
      budget: project.budget,
      status: project.status,
      progress: project.progress,
    });
    setFormErrors({});
    setShowModal(true);
  }

  function handleDelete(id) {
    setProjects(projects.filter((p) => p.id !== id));
  }

  function handleChange(e) {
    const val = e.target.name === "budget" || e.target.name === "progress"
      ? e.target.value
      : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required.";
    if (!form.client.trim()) errs.client = "Client name is required.";
    if (!form.start) errs.start = "Start date is required.";
    if (!form.end) errs.end = "End date is required.";
    else if (form.start && form.end && form.end < form.start) errs.end = "End date must be after start date.";
    if (!form.budget || Number(form.budget) <= 0) errs.budget = "Enter a valid budget amount.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const projectData = {
      ...form,
      budget: Number(form.budget),
      progress: Number(form.progress) || 0,
    };

    if (editingId) {
      setProjects(projects.map((p) => (p.id === editingId ? { ...p, ...projectData } : p)));
    } else {
      const newId = Math.max(0, ...projects.map((p) => p.id)) + 1;
      setProjects([...projects, { id: newId, ...projectData }]);
    }
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage and track all construction projects.</p>
      </div>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search projects, clients, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="in-progress">In Progress</option>
          <option value="planning">Planning</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <span className="filter-count">{filtered.length} projects</span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>
                      No projects match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.client}</td>
                      <td>{p.location}</td>
                      <td className="no-wrap">{formatDate(p.start)}</td>
                      <td className="no-wrap">{formatDate(p.end)}</td>
                      <td className="no-wrap">{fmt(p.budget)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span>
                      </td>
                      <td style={{ minWidth: 130 }}>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${getProgressColor(p.progress)}`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.progress}%</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit" onClick={() => openEdit(p)} title="Edit">&#9998;</button>
                          <button className="action-btn delete" onClick={() => handleDelete(p.id)} title="Delete">&#128465;</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Project Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Kathmandu Office Tower"
                  value={form.name}
                  onChange={handleChange}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className={`form-group ${formErrors.client ? "has-error" : ""}`}>
                <label htmlFor="client">Client</label>
                <input
                  id="client"
                  name="client"
                  type="text"
                  placeholder="e.g. Himalayan Capital Group"
                  value={form.client}
                  onChange={handleChange}
                />
                {formErrors.client && <span className="field-error">{formErrors.client}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <select id="location" name="location" value={form.location} onChange={handleChange}>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.start ? "has-error" : ""}`}>
                  <label htmlFor="start">Start Date</label>
                  <NepaliDatePicker id="start" name="start" value={form.start} onChange={handleChange} />
                  {formErrors.start && <span className="field-error">{formErrors.start}</span>}
                </div>
                <div className={`form-group ${formErrors.end ? "has-error" : ""}`}>
                  <label htmlFor="end">End Date</label>
                  <NepaliDatePicker id="end" name="end" value={form.end} onChange={handleChange} />
                  {formErrors.end && <span className="field-error">{formErrors.end}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.budget ? "has-error" : ""}`}>
                  <label htmlFor="budget">Budget (\u0930\u0942)</label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    placeholder="e.g. 50000000"
                    value={form.budget}
                    onChange={handleChange}
                  />
                  {formErrors.budget && <span className="field-error">{formErrors.budget}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="progress">Progress (%)</label>
                  <input
                    id="progress"
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
