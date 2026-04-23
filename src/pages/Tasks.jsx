import { useState } from "react";
import { TASKS, PROJECT_NAMES, PEOPLE } from "../data/sampleData";
import { useSettings } from "../context/SettingsContext";
import { useProject } from "../context/ProjectContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import NepaliDatePicker from "../components/NepaliDatePicker";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";

const emptyForm = { title: "", project: PROJECT_NAMES[0], assignee: PEOPLE[0], priority: "Medium", deadline: "", status: "To Do" };

function getPriorityBadge(p) {
  return { High: "badge-red", Medium: "badge-amber", Low: "badge-green" }[p] || "badge-gray";
}

function getStatusBadge(s) {
  return { "In Progress": "badge-green", "To Do": "badge-gray", Done: "badge-blue" }[s] || "badge-gray";
}

function Tasks() {
  const { settings } = useSettings();
  const { selectedProject } = useProject();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat);
  const [tasks, setTasks] = useState(() => loadJson("conpro:tasks", TASKS));
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useGlobalSave("conpro:tasks", tasks);

  const projectTasks = selectedProject
    ? tasks.filter((t) => t.project === selectedProject.name)
    : tasks;

  const filtered = projectTasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "all" || t.priority.toLowerCase() === priorityFilter;
    const matchStatus = statusFilter === "all" || t.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, project: selectedProject ? selectedProject.name : PROJECT_NAMES[0] });
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setForm({ title: task.title, project: task.project, assignee: task.assignee, priority: task.priority, deadline: task.deadline, status: task.status });
    setFormErrors({});
    setShowModal(true);
  }

  function handleDelete(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Task name is required.";
    if (!form.deadline) errs.deadline = "Deadline is required.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    if (editingId) {
      setTasks(tasks.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
    } else {
      const newId = Math.max(0, ...tasks.map((t) => t.id)) + 1;
      setTasks([...tasks, { id: newId, ...form }]);
    }
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tasks</h1>
        <p>Track and manage all project tasks.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--sp-4)" }}>
          Please select a project above to view its tasks.
        </div>
      )}

      {selectedProject && (
        <>
          <div className="filter-bar">
            <button className="btn btn-primary" onClick={openAdd}>+ Add Task</button>
            <div className="search-input-wrap">
              <input type="text" placeholder="Search tasks, people..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
            </div>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <span className="filter-count">{filtered.length} tasks</span>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned To</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>No tasks found.</td></tr>
                    ) : (
                      filtered.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600 }}>{t.title}</td>
                          <td>{t.assignee}</td>
                          <td><span className={`badge ${getPriorityBadge(t.priority)}`}>{t.priority}</span></td>
                          <td className="no-wrap">{formatDate(t.deadline)}</td>
                          <td><span className={`badge ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                          <td>
                            <div className="action-btns">
                              <button className="action-btn edit" onClick={() => openEdit(t)} title="Edit">&#9998;</button>
                              <button className="action-btn delete" onClick={() => handleDelete(t.id)} title="Delete">&#128465;</button>
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
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Task" : "Add New Task"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.title ? "has-error" : ""}`}>
                <label htmlFor="title">Task Name</label>
                <input id="title" name="title" type="text" placeholder="e.g. Foundation inspection" value={form.title} onChange={handleChange} />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignee">Assigned To</label>
                  <select id="assignee" name="assignee" value={form.assignee} onChange={handleChange}>
                    {PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    <option>To Do</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
                <div className={`form-group ${formErrors.deadline ? "has-error" : ""}`}>
                  <label htmlFor="deadline">Deadline</label>
                  <NepaliDatePicker id="deadline" name="deadline" value={form.deadline} onChange={handleChange} />
                  {formErrors.deadline && <span className="field-error">{formErrors.deadline}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? "Save Changes" : "Add Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
