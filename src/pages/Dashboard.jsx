import StatCard from "../components/StatCard";
import { useSettings } from "../context/SettingsContext";
import { useProject } from "../context/ProjectContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import {
  DASHBOARD_STATS,
  DASHBOARD_ACTIVITIES,
  PROJECTS,
  TASKS,
  TEAM,
  RISKS,
  REPORT_BUDGET,
  REPORT_PROGRESS,
  REPORT_DELAYED_TASKS,
  REPORT_SAFETY_INCIDENTS,
  SCHEDULE_ACTIVITIES,
  BUDGET_EXPENSES,
  DOCUMENTS,
} from "../data/sampleData";
import "../styles/pages.css";

function getStatusBadge(status) {
  const map = {
    "In Progress": "badge-green",
    Planning: "badge-amber",
    "On Hold": "badge-gray",
    Completed: "badge-blue",
  };
  return map[status] || "badge-gray";
}

function getProgressColor(progress) {
  if (progress >= 70) return "green";
  if (progress >= 40) return "blue";
  return "amber";
}

function getPriorityClass(p) {
  if (p === "High") return "badge-red";
  if (p === "Medium") return "badge-amber";
  return "badge-gray";
}

function npr(n) {
  return "Rs " + Number(n).toLocaleString("en-IN");
}

function Dashboard() {
  const { selectedProject: proj, selectedProjectId, selectProject, clearProject } = useProject();
  const { settings } = useSettings();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat);

  if (!proj) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Select a project to view detailed information.</p>
          </div>
        </div>

        <div className="stats-grid">
          {DASHBOARD_STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Projects</h2>
          </div>
          <div className="card-body">
            <div className="dash-project-grid">
              {PROJECTS.map((p) => (
                <div
                  key={p.id}
                  className="dash-project-card"
                  onClick={() => selectProject(p.id)}
                >
                  <div className="dash-project-icon">
                    {p.name.charAt(0)}
                  </div>
                  <div className="dash-project-info">
                    <h3>{p.name}</h3>
                    <p className="dash-project-location">{p.location}, Nepal</p>
                    <span className={`badge ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {DASHBOARD_ACTIVITIES.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-dot ${a.color}`} />
                  <div>
                    <div className="activity-text">
                      <span>{a.person}</span> {a.action}
                    </div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const keyword = proj.name.split(" ")[0].toLowerCase();
  const myTasks = TASKS.filter((t) => t.project === proj.name);
  const myBudget = REPORT_BUDGET.find((b) => b.project === proj.name);
  const myProgress = REPORT_PROGRESS.find((pr) => pr.project === proj.name);
  const myDelayed = REPORT_DELAYED_TASKS.filter((t) => t.project === proj.name);
  const mySafety = REPORT_SAFETY_INCIDENTS.filter((s) => s.project === proj.name);
  const myRisks = RISKS.filter(
    (r) =>
      r.title.toLowerCase().includes(keyword) ||
      r.description.toLowerCase().includes(keyword) ||
      r.mitigation.toLowerCase().includes(keyword)
  );
  const isKBP = proj.name === "Kathmandu Business Park";
  const mySchedule = isKBP ? SCHEDULE_ACTIVITIES : [];
  const myExpenses = isKBP ? BUDGET_EXPENSES : [];
  const assigneeNames = [...new Set(myTasks.map((t) => t.assignee))];
  const myTeam = TEAM.filter((m) => assigneeNames.includes(m.name));
  const myDocs = DOCUMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(keyword) ||
      d.name.toLowerCase().includes(proj.name.toLowerCase().slice(0, 8))
  );

  const doneT = myTasks.filter((t) => t.status === "Done").length;
  const ipT = myTasks.filter((t) => t.status === "In Progress").length;
  const todoT = myTasks.filter((t) => t.status === "To Do").length;
  const util = myBudget
    ? ((myBudget.spent / myBudget.allocated) * 100).toFixed(1)
    : 0;
  const durationMonths = Math.round(
    (new Date(proj.end) - new Date(proj.start)) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <button
            className="btn btn-outline"
            onClick={() => clearProject()}
          >
            ← Back
          </button>
          <div>
            <h1>{proj.name}</h1>
            <p>{proj.location}, Nepal — {proj.client}</p>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard icon="📊" color="green" value={`${proj.progress}%`} label="Progress" />
        <StatCard icon="💰" color="blue" value={npr(proj.budget)} label="Total Budget" />
        <StatCard icon="📋" color="amber" value={String(myTasks.length)} label="Total Tasks" />
        <StatCard icon="👥" color="green" value={String(myTeam.length)} label="Team Members" />
        <StatCard icon="⚠️" color="red" value={String(myDelayed.length)} label="Delayed Tasks" />
        <StatCard icon="🛡️" color="blue" value={String(mySafety.length)} label="Safety Incidents" />
      </div>

      {/* Project Overview */}
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h2>Project Details</h2>
            <span className={`badge ${getStatusBadge(proj.status)}`}>
              {proj.status}
            </span>
          </div>
          <div className="card-body">
            <div className="dash-detail-grid">
              <div className="dash-detail-item">
                <span className="dash-detail-label">Client</span>
                <span className="dash-detail-value">{proj.client}</span>
              </div>
              <div className="dash-detail-item">
                <span className="dash-detail-label">Location</span>
                <span className="dash-detail-value">{proj.location}</span>
              </div>
              <div className="dash-detail-item">
                <span className="dash-detail-label">Start Date</span>
                <span className="dash-detail-value">{formatDate(proj.start)}</span>
              </div>
              <div className="dash-detail-item">
                <span className="dash-detail-label">End Date</span>
                <span className="dash-detail-value">{formatDate(proj.end)}</span>
              </div>
              <div className="dash-detail-item">
                <span className="dash-detail-label">Duration</span>
                <span className="dash-detail-value">{durationMonths} months</span>
              </div>
              <div className="dash-detail-item">
                <span className="dash-detail-label">Progress</span>
                <span className="dash-detail-value">
                  <div className="progress-bar" style={{ width: 120, display: "inline-block", verticalAlign: "middle", marginRight: 8 }}>
                    <div
                      className={`progress-fill ${getProgressColor(proj.progress)}`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  {proj.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="card">
          <div className="card-header">
            <h2>Budget Overview</h2>
          </div>
          <div className="card-body">
            {myBudget ? (
              <>
                <div className="dash-detail-grid">
                  <div className="dash-detail-item">
                    <span className="dash-detail-label">Allocated</span>
                    <span className="dash-detail-value">{npr(myBudget.allocated)}</span>
                  </div>
                  <div className="dash-detail-item">
                    <span className="dash-detail-label">Spent</span>
                    <span className="dash-detail-value">{npr(myBudget.spent)}</span>
                  </div>
                  <div className="dash-detail-item">
                    <span className="dash-detail-label">Remaining</span>
                    <span className="dash-detail-value">{npr(myBudget.allocated - myBudget.spent)}</span>
                  </div>
                  <div className="dash-detail-item">
                    <span className="dash-detail-label">Utilization</span>
                    <span className="dash-detail-value">
                      <div className="progress-bar" style={{ width: 100, display: "inline-block", verticalAlign: "middle", marginRight: 8 }}>
                        <div
                          className={`progress-fill ${Number(util) > 90 ? "red" : Number(util) > 75 ? "amber" : "green"}`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                      {util}%
                    </span>
                  </div>
                </div>
                {myExpenses.length > 0 && (
                  <div style={{ marginTop: "var(--sp-4)" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "var(--sp-2)" }}>Category-wise Expenditure</h3>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Planned</th>
                            <th>Actual</th>
                            <th>Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myExpenses.map((e) => (
                            <tr key={e.id}>
                              <td style={{ fontWeight: 500 }}>{e.category}</td>
                              <td>{npr(e.planned)}</td>
                              <td>{npr(e.actual)}</td>
                              <td style={{ color: e.actual > e.planned ? "var(--color-red)" : "var(--color-green)" }}>
                                {npr(e.actual - e.planned)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>No budget data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Tasks */}
      <div className="content-grid" style={{ marginTop: "var(--sp-4)" }}>
        {/* Progress */}
        <div className="card">
          <div className="card-header">
            <h2>Progress Analysis</h2>
          </div>
          <div className="card-body">
            {myProgress ? (
              <div className="dash-detail-grid">
                <div className="dash-detail-item">
                  <span className="dash-detail-label">Planned</span>
                  <span className="dash-detail-value">{myProgress.planned}%</span>
                </div>
                <div className="dash-detail-item">
                  <span className="dash-detail-label">Actual</span>
                  <span className="dash-detail-value">{myProgress.actual}%</span>
                </div>
                <div className="dash-detail-item">
                  <span className="dash-detail-label">Variance</span>
                  <span
                    className="dash-detail-value"
                    style={{ color: myProgress.actual >= myProgress.planned ? "var(--color-green)" : "var(--color-red)" }}
                  >
                    {myProgress.actual - myProgress.planned >= 0 ? "+" : ""}
                    {myProgress.actual - myProgress.planned}%
                  </span>
                </div>
                <div className="dash-detail-item">
                  <span className="dash-detail-label">Assessment</span>
                  <span className="dash-detail-value">
                    {myProgress.actual >= myProgress.planned
                      ? "On Track"
                      : myProgress.actual >= myProgress.planned - 5
                        ? "Minor Delay"
                        : "Behind Schedule"}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>No progress data available.</p>
            )}

            {/* Task Status Summary */}
            <div style={{ marginTop: "var(--sp-4)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "var(--sp-2)" }}>Task Status</h3>
              <div className="dash-bar-group">
                <div className="dash-bar-item">
                  <span>Done ({doneT})</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill green" style={{ width: `${myTasks.length ? (doneT / myTasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="dash-bar-item">
                  <span>In Progress ({ipT})</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill blue" style={{ width: `${myTasks.length ? (ipT / myTasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="dash-bar-item">
                  <span>To Do ({todoT})</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill amber" style={{ width: `${myTasks.length ? (todoT / myTasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="card">
          <div className="card-header">
            <h2>Project Team ({myTeam.length})</h2>
          </div>
          <div className="card-body">
            {myTeam.length > 0 ? (
              <div className="dash-team-list">
                {myTeam.map((m) => (
                  <div className="dash-team-item" key={m.name}>
                    <div className="dash-team-avatar" style={{ background: m.color }}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{m.role}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>No team members assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card" style={{ marginTop: "var(--sp-4)" }}>
        <div className="card-header">
          <h2>Tasks ({myTasks.length})</h2>
        </div>
        <div className="card-body">
          {myTasks.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((t, i) => (
                    <tr key={t.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      <td>{t.assignee}</td>
                      <td>
                        <span className={`badge ${getPriorityClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>{formatDate(t.deadline)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>No tasks for this project.</p>
          )}
        </div>
      </div>

      {/* Delayed Tasks */}
      {myDelayed.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2 style={{ color: "var(--color-red)" }}>Delayed Tasks ({myDelayed.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Days Late</th>
                  </tr>
                </thead>
                <tbody>
                  {myDelayed.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{t.task}</td>
                      <td>{t.assignee}</td>
                      <td>{formatDate(t.due)}</td>
                      <td style={{ color: "var(--color-red)", fontWeight: 600 }}>
                        {t.daysLate} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      {mySchedule.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2>Schedule & Milestones ({mySchedule.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Activity</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mySchedule.map((a) => (
                    <tr key={a.id}>
                      <td>{a.type === "milestone" ? "◆" : ""}</td>
                      <td style={{ fontWeight: a.type === "milestone" ? 600 : 400 }}>
                        {a.task}
                      </td>
                      <td>{formatDate(a.start)}</td>
                      <td>{formatDate(a.end)}</td>
                      <td>{a.person}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Risks */}
      {myRisks.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2>Risks ({myRisks.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Risk</th>
                    <th>Prob</th>
                    <th>Impact</th>
                    <th>Score</th>
                    <th>Owner</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRisks.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td style={{ fontWeight: 500 }}>{r.title}</td>
                      <td>{r.probability}/5</td>
                      <td>{r.impact}/5</td>
                      <td style={{ fontWeight: 600, color: r.probability * r.impact >= 15 ? "var(--color-red)" : "inherit" }}>
                        {r.probability * r.impact}/25
                      </td>
                      <td>{r.owner}</td>
                      <td>
                        <span className={`badge ${r.status === "Closed" ? "badge-green" : r.status === "Mitigating" ? "badge-amber" : "badge-red"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Safety Incidents */}
      {mySafety.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2>Safety Incidents ({mySafety.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {mySafety.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{formatDate(s.date)}</td>
                      <td>{s.type}</td>
                      <td>{s.description}</td>
                      <td>
                        <span className={`badge ${s.severity === "High" ? "badge-red" : s.severity === "Medium" ? "badge-amber" : "badge-gray"}`}>
                          {s.severity}
                        </span>
                      </td>
                      <td>{s.actionTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {myDocs.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-4)" }}>
          <div className="card-header">
            <h2>Documents ({myDocs.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myDocs.map((d, i) => (
                    <tr key={d.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td>{d.category}</td>
                      <td>.{d.ext}</td>
                      <td>{d.uploadedBy}</td>
                      <td>{formatDate(d.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
