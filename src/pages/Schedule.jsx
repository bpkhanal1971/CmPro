import { useState } from "react";
import {
  SCHEDULE_ACTIVITIES,
  SCHEDULE_PROJECT,
  SCHEDULE_TIMELINE_START,
  SCHEDULE_TIMELINE_END,
  PEOPLE,
} from "../data/sampleData";
import { useSettings } from "../context/SettingsContext";
import { useProject } from "../context/ProjectContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import NepaliDatePicker from "../components/NepaliDatePicker";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/schedule.css";
import "../styles/pages.css";

const TOTAL_DAYS = Math.ceil((SCHEDULE_TIMELINE_END - SCHEDULE_TIMELINE_START) / (1000 * 60 * 60 * 24));
const STATUSES = ["Upcoming", "In Progress", "Completed"];

function getMonths() {
  const months = [];
  const d = new Date(SCHEDULE_TIMELINE_START);
  while (d <= SCHEDULE_TIMELINE_END) {
    months.push(new Date(d));
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function dayOffset(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - SCHEDULE_TIMELINE_START) / (1000 * 60 * 60 * 24)));
}

function daySpan(startStr, endStr) {
  return Math.max(1, Math.ceil((new Date(endStr) - new Date(startStr)) / (1000 * 60 * 60 * 24)) + 1);
}

function getStatusClass(status) {
  return { Completed: "completed", "In Progress": "in-progress", Upcoming: "upcoming" }[status] || "upcoming";
}

function getStatusBadge(status) {
  return { Completed: "badge-blue", "In Progress": "badge-green", Upcoming: "badge-gray" }[status] || "badge-gray";
}

const emptyForm = { task: "", start: "", end: "", person: PEOPLE[0], status: "Upcoming", dependency: "", type: "task" };

function Schedule() {
  const { settings } = useSettings();
  const { selectedProject } = useProject();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat, { showYear: false });
  const [activities, setActivities] = useState(() => loadJson("conpro:schedule", SCHEDULE_ACTIVITIES));
  const [view, setView] = useState("gantt");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const months = getMonths();

  useGlobalSave("conpro:schedule", activities);

  const taskCount = activities.filter((a) => a.type === "task").length;
  const milestoneCount = activities.filter((a) => a.type === "milestone").length;

  function openAddActivity() {
    setForm({ ...emptyForm, type: "task" });
    setFormErrors({});
    setShowModal(true);
  }

  function openAddMilestone() {
    setForm({ ...emptyForm, type: "milestone" });
    setFormErrors({});
    setShowModal(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function validate() {
    const errs = {};
    if (!form.task.trim()) errs.task = "Activity name is required.";
    if (!form.start) errs.start = "Start date is required.";
    if (form.type === "task") {
      if (!form.end) errs.end = "End date is required.";
      else if (form.start && form.end && form.end < form.start) errs.end = "End date must be after start date.";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const newId = Math.max(0, ...activities.map((a) => a.id)) + 1;
    const endDate = form.type === "milestone" ? form.start : form.end;
    setActivities([...activities, { id: newId, ...form, end: endDate }]);
    setShowModal(false);
  }

  function handleDelete(id) {
    setActivities(activities.filter((a) => a.id !== id));
  }

  const isMilestoneForm = form.type === "milestone";

  return (
    <div>
      <div className="page-header">
        <h1>Schedule</h1>
        <p>Construction schedule with Gantt chart and milestones.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
          Please select a project above to view its schedule.
        </div>
      )}

      {selectedProject && selectedProject.name !== "Kathmandu Business Park" && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
          Schedule data for {selectedProject.name} is not yet available. Detailed schedule is currently available for Kathmandu Business Park.
        </div>
      )}

      {selectedProject && selectedProject.name === "Kathmandu Business Park" && <>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "var(--sp-3)" }}>{SCHEDULE_PROJECT} — {taskCount} activities, {milestoneCount} milestones.</p>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={openAddActivity}>+ New Activity</button>
        <button className="btn btn-outline" onClick={openAddMilestone}>+ Add Milestone</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button className={`btn btn-tab ${view === "gantt" ? "active" : ""}`} onClick={() => setView("gantt")}>Gantt View</button>
          <button className={`btn btn-tab ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>Table View</button>
        </div>
      </div>

      {view === "table" && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th></th><th>Task Name</th><th>Start Date</th><th>End Date</th><th>Assigned To</th><th>Status</th><th>Dependency</th><th style={{ width: 60 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className={a.type === "milestone" ? "milestone-row" : ""}>
                      <td style={{ width: 28, textAlign: "center" }}>{a.type === "milestone" ? "\u{1F3F3}\uFE0F" : ""}</td>
                      <td style={{ fontWeight: 600 }}>
                        {a.task}
                        {a.type === "milestone" && <span className="milestone-label">Milestone</span>}
                      </td>
                      <td className="no-wrap">{formatDate(a.start)}</td>
                      <td className="no-wrap">{formatDate(a.end)}</td>
                      <td>{a.person}</td>
                      <td><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                      <td>{a.dependency}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn delete" onClick={() => handleDelete(a.id)} title="Delete">&#128465;</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === "gantt" && (
        <div className="gantt-wrapper card">
          <div className="gantt-container">
            <div className="gantt-labels">
              <div className="gantt-label-header">Task</div>
              {activities.map((a) => (
                <div key={a.id} className={`gantt-label-row ${a.type === "milestone" ? "is-milestone" : ""}`}>
                  <span className="gantt-label-text">{a.task}</span>
                  <span className="gantt-label-person">{a.person}</span>
                </div>
              ))}
            </div>
            <div className="gantt-timeline-scroll">
              <div className="gantt-months" style={{ width: TOTAL_DAYS * 4 }}>
                {months.map((m, i) => {
                  const offset = dayOffset(m.toISOString().slice(0, 10));
                  const nextMonth = new Date(m);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  const daysInMonth = Math.ceil((Math.min(nextMonth, SCHEDULE_TIMELINE_END) - m) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="gantt-month" style={{ left: offset * 4, width: daysInMonth * 4 }}>
                      {m.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  );
                })}
              </div>
              <div className="gantt-rows" style={{ width: TOTAL_DAYS * 4 }}>
                {months.map((m, i) => (
                  <div key={i} className="gantt-grid-line" style={{ left: dayOffset(m.toISOString().slice(0, 10)) * 4 }} />
                ))}
                <div className="gantt-today" style={{ left: dayOffset(new Date().toISOString().slice(0, 10)) * 4 }} />
                {activities.map((a) => {
                  const left = dayOffset(a.start) * 4;
                  const width = daySpan(a.start, a.end) * 4;
                  const statusCls = getStatusClass(a.status);
                  return (
                    <div key={a.id} className="gantt-row">
                      {a.type === "milestone" ? (
                        <div className={`gantt-milestone ${statusCls}`} style={{ left }} title={`${a.task} — ${formatDate(a.start)}`}>
                          <span className="gantt-diamond" />
                        </div>
                      ) : (
                        <div className={`gantt-bar ${statusCls}`} style={{ left, width: Math.max(width, 8) }} title={`${a.task}: ${formatDate(a.start)} – ${formatDate(a.end)}`}>
                          <span className="gantt-bar-label">{a.task}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="gantt-legend">
            <span className="gantt-legend-item"><span className="gantt-legend-swatch completed" /> Completed</span>
            <span className="gantt-legend-item"><span className="gantt-legend-swatch in-progress" /> In Progress</span>
            <span className="gantt-legend-item"><span className="gantt-legend-swatch upcoming" /> Upcoming</span>
            <span className="gantt-legend-item"><span className="gantt-legend-diamond" /> Milestone</span>
            <span className="gantt-legend-item"><span className="gantt-legend-today" /> Today</span>
          </div>
        </div>
      )}

      </>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isMilestoneForm ? "Add Milestone" : "Add New Activity"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.task ? "has-error" : ""}`}>
                <label htmlFor="task">{isMilestoneForm ? "Milestone Name" : "Activity Name"}</label>
                <input
                  id="task"
                  name="task"
                  type="text"
                  placeholder={isMilestoneForm ? "e.g. Design Approval" : "e.g. Piling Work - Block C"}
                  value={form.task}
                  onChange={handleChange}
                />
                {formErrors.task && <span className="field-error">{formErrors.task}</span>}
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.start ? "has-error" : ""}`}>
                  <label htmlFor="start">{isMilestoneForm ? "Date" : "Start Date"}</label>
                  <NepaliDatePicker id="start" name="start" value={form.start} onChange={handleChange} />
                  {formErrors.start && <span className="field-error">{formErrors.start}</span>}
                </div>
                {!isMilestoneForm && (
                  <div className={`form-group ${formErrors.end ? "has-error" : ""}`}>
                    <label htmlFor="end">End Date</label>
                    <NepaliDatePicker id="end" name="end" value={form.end} onChange={handleChange} />
                    {formErrors.end && <span className="field-error">{formErrors.end}</span>}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="person">Assigned To</label>
                  <select id="person" name="person" value={form.person} onChange={handleChange}>
                    {PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dependency">Dependency</label>
                <input
                  id="dependency"
                  name="dependency"
                  type="text"
                  placeholder="e.g. Foundation Inspection"
                  value={form.dependency}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isMilestoneForm ? "Add Milestone" : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
