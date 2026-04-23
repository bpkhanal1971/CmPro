import { useState } from "react";
import {
  REPORT_PROGRESS, REPORT_BUDGET, REPORT_RISKS,
  REPORT_DELAYED_TASKS, REPORT_SAFETY_INCIDENTS,
  REPORT_MONTHLY_COMPLETION,
  PROJECTS, TASKS, RISKS, BUDGET_EXPENSES,
  SCHEDULE_ACTIVITIES, TEAM, DOCUMENTS,
  EVM_DATA,
} from "../data/sampleData";
import { useSettings } from "../context/SettingsContext";
import { useProject } from "../context/ProjectContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import { exportPDF, exportExcel } from "../utils/exportReport";
import { exportFullReport } from "../utils/exportFullReport";
import { exportProjectReport } from "../utils/exportProjectReport";
import ProjectSelector from "../components/ProjectSelector";
import SCurveChart from "../components/SCurveChart";
import EVMChart from "../components/EVMChart";
import "../styles/pages.css";
import "../styles/risk.css";
import "../styles/reports.css";

function fmtCurrency(n) {
  return "\u0930\u0942 " + Number(n).toLocaleString("en-IN");
}

function severityBadge(s) {
  return { High: "badge-red", Medium: "badge-amber", Low: "badge-green" }[s] || "badge-gray";
}

const TABS = ["Progress", "S-Curve", "EVM", "Budget", "Risks", "Delayed Tasks", "Safety"];

function Reports() {
  const { settings } = useSettings();
  const { selectedProject: globalProject } = useProject();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat);
  const fmt = fmtCurrency;
  const [activeTab, setActiveTab] = useState("Progress");

  const projName = globalProject ? globalProject.name : null;

  const filteredProgress = projName ? REPORT_PROGRESS.filter((p) => p.project === projName) : REPORT_PROGRESS;
  const filteredBudget = projName ? REPORT_BUDGET.filter((b) => b.project === projName) : REPORT_BUDGET;
  const filteredDelayed = projName ? REPORT_DELAYED_TASKS.filter((t) => t.project === projName) : REPORT_DELAYED_TASKS;
  const filteredSafety = projName ? REPORT_SAFETY_INCIDENTS.filter((s) => s.project === projName) : REPORT_SAFETY_INCIDENTS;

  const totalAllocated = filteredBudget.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = filteredBudget.reduce((s, b) => s + b.spent, 0);
  const budgetMax = filteredBudget.length ? Math.max(...filteredBudget.map((b) => b.allocated)) : 1;
  const riskTotal = REPORT_RISKS.reduce((s, r) => s + r.count, 0);

  const inProgressCount = filteredProgress.filter((p) => p.status === "In Progress").length;
  const planningCount = filteredProgress.filter((p) => p.status === "Planning").length;
  const onHoldCount = filteredProgress.filter((p) => p.status === "On Hold").length;

  const evmProject = projName && EVM_DATA[projName] ? EVM_DATA[projName] : null;
  const evmCurrent = evmProject
    ? (() => {
        const actuals = evmProject.months.filter((m) => m.EV > 0);
        return actuals.length > 0 ? actuals[actuals.length - 1] : null;
      })()
    : null;
  const evmMetrics = evmCurrent && evmProject ? (() => {
    const { PV, EV, AC } = evmCurrent;
    const BAC = evmProject.BAC;
    const CV = EV - AC;
    const SV = EV - PV;
    const CPI = AC > 0 ? EV / AC : 0;
    const SPI = PV > 0 ? EV / PV : 0;
    const EAC = CPI > 0 ? BAC / CPI : BAC;
    const ETC = EAC - AC;
    const VAC = BAC - EAC;
    const TCPI = (BAC - AC) > 0 ? (BAC - EV) / (BAC - AC) : 0;
    const pctComplete = evmCurrent.actualPct;
    return { PV, EV, AC, BAC, CV, SV, CPI, SPI, EAC, ETC, VAC, TCPI, pctComplete };
  })() : null;

  const exportData = {
    progress: REPORT_PROGRESS,
    budget: REPORT_BUDGET,
    risks: REPORT_RISKS,
    delayedTasks: REPORT_DELAYED_TASKS,
    safetyIncidents: REPORT_SAFETY_INCIDENTS,
    monthlyCompletion: REPORT_MONTHLY_COMPLETION,
    formatDate,
  };

  const fullReportData = {
    ...exportData,
    projects: PROJECTS,
    tasks: TASKS,
    riskRecords: RISKS,
    budgetExpenses: BUDGET_EXPENSES,
    scheduleActivities: SCHEDULE_ACTIVITIES,
    team: TEAM,
    documents: DOCUMENTS,
  };

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Analytics, summaries, and exportable reports.</p>
      </div>

      <ProjectSelector />

      {!globalProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--sp-4)" }}>
          Please select a project above to view its reports.
        </div>
      )}

      {globalProject && <>
      <div className="summary-grid">
        <div className="summary-card"><div className="summary-icon green">{"\u{1F4CA}"}</div><div><div className="summary-value">{filteredProgress.length}</div><div className="summary-label">{projName ? "Project" : "Active Projects"}</div></div></div>
        <div className="summary-card"><div className="summary-icon blue">{"\u{1F4B0}"}</div><div><div className="summary-value">{fmt(totalSpent)}</div><div className="summary-label">Total Spent</div></div></div>
        <div className="summary-card"><div className="summary-icon red">{"\u{23F0}"}</div><div><div className="summary-value">{filteredDelayed.length}</div><div className="summary-label">Delayed Tasks</div></div></div>
        <div className="summary-card"><div className="summary-icon amber">{"\u26A0\uFE0F"}</div><div><div className="summary-value">{riskTotal}</div><div className="summary-label">Total Risks</div></div></div>
        <div className="summary-card"><div className="summary-icon red">{"\u{1F6E1}"}</div><div><div className="summary-value">{filteredSafety.length}</div><div className="summary-label">Safety Incidents</div></div></div>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} className={`tab-item ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
        <div className="rpt-export-group">
          <button className="btn btn-primary rpt-export-btn" onClick={() => exportProjectReport(globalProject.name, fullReportData)}>Project Report</button>
          <button className="btn btn-outline rpt-export-btn" onClick={() => exportFullReport(fullReportData)}>All Projects</button>
          <button className="btn btn-outline rpt-export-btn" onClick={() => exportExcel(activeTab, exportData)}>Excel</button>
        </div>
      </div>

      {activeTab === "Progress" && (
        <div className="rpt-section">
          <div className="content-grid">
            <div className="card">
              <div className="card-header"><h2>Monthly Task Completion</h2></div>
              <div className="card-body">
                <div className="chart-legend">
                  <span><span className="legend-swatch" style={{ background: "var(--green-300)" }} /> Planned</span>
                  <span><span className="legend-swatch" style={{ background: "var(--color-primary)" }} /> Actual</span>
                </div>
                <div className="chart-bars">
                  {REPORT_MONTHLY_COMPLETION.map((d) => (
                    <div className="chart-bar-group" key={d.month}>
                      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: "100%" }}>
                        <div className="chart-bar" style={{ height: `${d.planned}%`, background: "#a5d6a7" }} title={`Planned: ${d.planned}`} />
                        <div className="chart-bar" style={{ height: `${d.actual}%`, background: "#2e7d32" }} title={`Actual: ${d.actual}`} />
                      </div>
                      <span className="chart-label">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2>Project Status Overview</h2></div>
              <div className="card-body">
                <div className="rpt-status-grid">
                  <div className="rpt-status-box" style={{ background: "#e8f5e9" }}><span>{inProgressCount}</span><small>In Progress</small></div>
                  <div className="rpt-status-box" style={{ background: "#fff8e1" }}><span>{planningCount}</span><small>Planning</small></div>
                  <div className="rpt-status-box" style={{ background: "#e3f2fd" }}><span>0</span><small>Completed</small></div>
                  <div className="rpt-status-box" style={{ background: "#f5f5f5" }}><span>{onHoldCount}</span><small>On Hold</small></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h2>Project Progress Details</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Project</th><th>Planned %</th><th>Actual %</th><th>Variance</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredProgress.map((p) => {
                      const v = p.actual - p.planned;
                      return (
                        <tr key={p.project}>
                          <td style={{ fontWeight: 600 }}>{p.project}</td>
                          <td>{p.planned}%</td>
                          <td>{p.actual}%</td>
                          <td><span style={{ color: v >= 0 ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>{v >= 0 ? "+" : ""}{v}%</span></td>
                          <td style={{ minWidth: 120 }}>
                            <div className="progress-bar"><div className={`progress-fill ${p.actual >= p.planned ? "green" : "amber"}`} style={{ width: `${p.actual}%` }} /></div>
                          </td>
                          <td><span className={`badge ${p.status === "In Progress" ? "badge-green" : p.status === "Planning" ? "badge-amber" : "badge-gray"}`}>{p.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "S-Curve" && (
        <div className="rpt-section">
          {evmProject ? (
            <>
              <div className="card">
                <div className="card-header"><h2>S-Curve: Progress vs. Time — {projName}</h2></div>
                <div className="card-body">
                  <SCurveChart data={evmProject.months} projectName={projName} />
                </div>
              </div>

              <div className="content-grid">
                <div className="card">
                  <div className="card-header"><h2>What is the S-Curve?</h2></div>
                  <div className="card-body rpt-explain">
                    <p>
                      The <strong>S-Curve</strong> is a graphical representation of cumulative progress (or costs/resources) plotted
                      against time. It gets its name from the characteristic "S" shape: progress is slow at the beginning
                      (mobilization &amp; planning), accelerates rapidly during peak construction, and tapers off during
                      finishing &amp; commissioning.
                    </p>
                    <p>In construction project management, the S-Curve serves three critical purposes:</p>
                    <ul>
                      <li><strong>Baseline Tracking:</strong> The dashed green line shows the originally planned cumulative
                      progress — the baseline schedule. Any deviation from this curve signals a schedule variance.</li>
                      <li><strong>Actual Performance:</strong> The solid blue line shows how much work has actually been
                      completed to date. When this line falls below the baseline, the project is behind schedule.</li>
                      <li><strong>Forecasting:</strong> The gap between the two curves helps project managers estimate
                      recovery time, forecast completion dates, and make resource allocation decisions.</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h2>Current S-Curve Analysis</h2></div>
                  <div className="card-body rpt-explain">
                    {evmCurrent && (
                      <>
                        <div className="rpt-scurve-kpis">
                          <div className="rpt-kpi-item">
                            <span className="rpt-kpi-value">{evmCurrent.plannedPct}%</span>
                            <span className="rpt-kpi-label">Planned Progress</span>
                          </div>
                          <div className="rpt-kpi-item">
                            <span className="rpt-kpi-value" style={{ color: evmCurrent.actualPct >= evmCurrent.plannedPct ? "#2e7d32" : "#e53935" }}>{evmCurrent.actualPct}%</span>
                            <span className="rpt-kpi-label">Actual Progress</span>
                          </div>
                          <div className="rpt-kpi-item">
                            <span className="rpt-kpi-value" style={{ color: evmCurrent.actualPct - evmCurrent.plannedPct >= 0 ? "#2e7d32" : "#e53935" }}>
                              {evmCurrent.actualPct - evmCurrent.plannedPct >= 0 ? "+" : ""}{evmCurrent.actualPct - evmCurrent.plannedPct}%
                            </span>
                            <span className="rpt-kpi-label">Schedule Deviation</span>
                          </div>
                        </div>
                        <p>
                          As of the latest data point, <strong>{projName}</strong> has achieved <strong>{evmCurrent.actualPct}%</strong> cumulative
                          progress against a planned target of <strong>{evmCurrent.plannedPct}%</strong>. This represents
                          a <strong>{Math.abs(evmCurrent.actualPct - evmCurrent.plannedPct)}% {evmCurrent.actualPct >= evmCurrent.plannedPct ? "ahead-of-schedule" : "behind-schedule"}</strong> deviation.
                        </p>
                        <p>
                          {evmCurrent.actualPct < evmCurrent.plannedPct
                            ? "The actual curve is consistently below the baseline, indicating a schedule lag. The project team should review resource allocation, identify bottlenecks, and consider acceleration measures such as overtime, additional crews, or fast-tracking activities."
                            : "The actual curve meets or exceeds the baseline, indicating the project is on track. The project team should continue monitoring to maintain this performance and ensure quality standards are not compromised by accelerated work."}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2>Monthly Progress Data</h2></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th style={{ textAlign: "right" }}>Planned (%)</th>
                          <th style={{ textAlign: "right" }}>Actual (%)</th>
                          <th style={{ textAlign: "right" }}>Deviation (%)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evmProject.months.filter((m) => m.actualPct > 0).map((m, i) => {
                          const dev = m.actualPct - m.plannedPct;
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{m.month}</td>
                              <td style={{ textAlign: "right" }}>{m.plannedPct}%</td>
                              <td style={{ textAlign: "right" }}>{m.actualPct}%</td>
                              <td style={{ textAlign: "right" }}>
                                <span style={{ color: dev >= 0 ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>
                                  {dev >= 0 ? "+" : ""}{dev}%
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${dev >= 0 ? "badge-green" : dev >= -3 ? "badge-amber" : "badge-red"}`}>
                                  {dev >= 0 ? "On Track" : dev >= -3 ? "Minor Delay" : "Behind"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
              S-Curve data is not available for the selected project.
            </div>
          )}
        </div>
      )}

      {activeTab === "EVM" && (
        <div className="rpt-section">
          {evmProject && evmMetrics ? (
            <>
              <div className="card">
                <div className="card-header"><h2>Earned Value Management (EVM) — {projName}</h2></div>
                <div className="card-body">
                  <EVMChart data={evmProject.months} BAC={evmProject.BAC} />
                </div>
              </div>

              <div className="rpt-evm-kpi-grid">
                <div className={`rpt-evm-kpi-card ${evmMetrics.CPI >= 1 ? "positive" : "negative"}`}>
                  <span className="rpt-evm-kpi-value">{evmMetrics.CPI.toFixed(2)}</span>
                  <span className="rpt-evm-kpi-label">CPI (Cost Performance Index)</span>
                  <span className="rpt-evm-kpi-desc">{evmMetrics.CPI >= 1 ? "Under budget — getting more value per rupee" : "Over budget — spending more than planned per unit of work"}</span>
                </div>
                <div className={`rpt-evm-kpi-card ${evmMetrics.SPI >= 1 ? "positive" : "negative"}`}>
                  <span className="rpt-evm-kpi-value">{evmMetrics.SPI.toFixed(2)}</span>
                  <span className="rpt-evm-kpi-label">SPI (Schedule Performance Index)</span>
                  <span className="rpt-evm-kpi-desc">{evmMetrics.SPI >= 1 ? "Ahead of schedule — more work done than planned" : "Behind schedule — less work completed than planned"}</span>
                </div>
                <div className={`rpt-evm-kpi-card ${evmMetrics.CV >= 0 ? "positive" : "negative"}`}>
                  <span className="rpt-evm-kpi-value">{fmt(Math.abs(evmMetrics.CV))}</span>
                  <span className="rpt-evm-kpi-label">CV (Cost Variance)</span>
                  <span className="rpt-evm-kpi-desc">{evmMetrics.CV >= 0 ? "Savings — spent less than the value earned" : "Overrun — spent more than the value of work completed"}</span>
                </div>
                <div className={`rpt-evm-kpi-card ${evmMetrics.SV >= 0 ? "positive" : "negative"}`}>
                  <span className="rpt-evm-kpi-value">{fmt(Math.abs(evmMetrics.SV))}</span>
                  <span className="rpt-evm-kpi-label">SV (Schedule Variance)</span>
                  <span className="rpt-evm-kpi-desc">{evmMetrics.SV >= 0 ? "Ahead — earned more value than planned at this point" : "Behind — earned less value than planned at this point"}</span>
                </div>
              </div>

              <div className="content-grid">
                <div className="card">
                  <div className="card-header"><h2>What is Earned Value Management?</h2></div>
                  <div className="card-body rpt-explain">
                    <p>
                      <strong>Earned Value Management (EVM)</strong> is an industry-standard methodology that integrates
                      scope, schedule, and cost data to provide an objective measure of project performance. Unlike simple
                      cost tracking or schedule monitoring alone, EVM answers: <em>"For every rupee spent, how much value
                      have we actually delivered?"</em>
                    </p>
                    <h4>The Three Fundamental Metrics</h4>
                    <ul>
                      <li><strong>Planned Value (PV)</strong> — also called BCWS (Budgeted Cost of Work Scheduled): The
                      authorized budget allocated for the work scheduled to be completed by a given date. This is the
                      baseline against which performance is measured.</li>
                      <li><strong>Earned Value (EV)</strong> — also called BCWP (Budgeted Cost of Work Performed): The
                      budgeted amount for the work actually completed. This measures the "value" of completed work in
                      terms of the original budget.</li>
                      <li><strong>Actual Cost (AC)</strong> — also called ACWP (Actual Cost of Work Performed): The total
                      cost actually incurred for the work completed to date.</li>
                    </ul>
                    <h4>Key Performance Indices</h4>
                    <ul>
                      <li><strong>CPI = EV / AC</strong> — Values &gt; 1.0 indicate cost efficiency (under budget). Values &lt; 1.0 indicate cost overrun.</li>
                      <li><strong>SPI = EV / PV</strong> — Values &gt; 1.0 indicate schedule efficiency (ahead). Values &lt; 1.0 indicate schedule delay.</li>
                      <li><strong>TCPI = (BAC - EV) / (BAC - AC)</strong> — The performance level required to complete the remaining work within the original budget.</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h2>Forecast &amp; Projections</h2></div>
                  <div className="card-body rpt-explain">
                    <div className="rpt-evm-forecast-table">
                      <table className="data-table">
                        <tbody>
                          <tr><td style={{ fontWeight: 600 }}>Budget at Completion (BAC)</td><td style={{ textAlign: "right" }}>{fmt(evmMetrics.BAC)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>Earned Value to Date (EV)</td><td style={{ textAlign: "right" }}>{fmt(evmMetrics.EV)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>Actual Cost to Date (AC)</td><td style={{ textAlign: "right" }}>{fmt(evmMetrics.AC)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>Estimate at Completion (EAC)</td><td style={{ textAlign: "right", color: evmMetrics.EAC > evmMetrics.BAC ? "var(--color-danger)" : "var(--color-success)" }}>{fmt(evmMetrics.EAC)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>Estimate to Complete (ETC)</td><td style={{ textAlign: "right" }}>{fmt(evmMetrics.ETC)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>Variance at Completion (VAC)</td><td style={{ textAlign: "right", color: evmMetrics.VAC >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>{evmMetrics.VAC >= 0 ? "+" : ""}{fmt(evmMetrics.VAC)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>TCPI (To-Complete Performance)</td><td style={{ textAlign: "right", fontWeight: 700 }}>{evmMetrics.TCPI.toFixed(2)}</td></tr>
                          <tr><td style={{ fontWeight: 600 }}>% Complete</td><td style={{ textAlign: "right" }}>{evmMetrics.pctComplete}%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <h4>Interpretation</h4>
                      <p>
                        Based on current performance (CPI = {evmMetrics.CPI.toFixed(2)}), the project is forecast to
                        cost <strong>{fmt(evmMetrics.EAC)}</strong> at completion — {evmMetrics.EAC > evmMetrics.BAC
                          ? `a potential overrun of ${fmt(evmMetrics.EAC - evmMetrics.BAC)} (${((evmMetrics.EAC - evmMetrics.BAC) / evmMetrics.BAC * 100).toFixed(1)}% over budget)`
                          : `a potential saving of ${fmt(evmMetrics.BAC - evmMetrics.EAC)} (${((evmMetrics.BAC - evmMetrics.EAC) / evmMetrics.BAC * 100).toFixed(1)}% under budget)`
                        }.
                      </p>
                      <p>
                        The TCPI of <strong>{evmMetrics.TCPI.toFixed(2)}</strong> means the project must achieve a cost
                        efficiency of {evmMetrics.TCPI.toFixed(2)} for the remaining work to finish within the original
                        budget.
                        {evmMetrics.TCPI > 1.1
                          ? " This is significantly above 1.0, suggesting the original budget may not be achievable without corrective action."
                          : evmMetrics.TCPI > 1.0
                          ? " This is slightly above 1.0, which is achievable but requires disciplined cost control."
                          : " This is at or below 1.0, indicating the project has budget headroom for the remaining work."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2>Monthly EVM Data</h2></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th style={{ textAlign: "right" }}>PV (Planned)</th>
                          <th style={{ textAlign: "right" }}>EV (Earned)</th>
                          <th style={{ textAlign: "right" }}>AC (Actual)</th>
                          <th style={{ textAlign: "right" }}>CV</th>
                          <th style={{ textAlign: "right" }}>SV</th>
                          <th style={{ textAlign: "right" }}>CPI</th>
                          <th style={{ textAlign: "right" }}>SPI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evmProject.months.filter((m) => m.EV > 0).map((m, i) => {
                          const cv = m.EV - m.AC;
                          const sv = m.EV - m.PV;
                          const cpi = m.AC > 0 ? (m.EV / m.AC).toFixed(2) : "—";
                          const spi = m.PV > 0 ? (m.EV / m.PV).toFixed(2) : "—";
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{m.month}</td>
                              <td style={{ textAlign: "right" }} className="no-wrap">{fmt(m.PV)}</td>
                              <td style={{ textAlign: "right" }} className="no-wrap">{fmt(m.EV)}</td>
                              <td style={{ textAlign: "right" }} className="no-wrap">{fmt(m.AC)}</td>
                              <td style={{ textAlign: "right" }}><span style={{ color: cv >= 0 ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>{cv >= 0 ? "+" : ""}{fmt(cv)}</span></td>
                              <td style={{ textAlign: "right" }}><span style={{ color: sv >= 0 ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>{sv >= 0 ? "+" : ""}{fmt(sv)}</span></td>
                              <td style={{ textAlign: "right" }}><span style={{ fontWeight: 600, color: Number(cpi) >= 1 ? "var(--color-success)" : "var(--color-danger)" }}>{cpi}</span></td>
                              <td style={{ textAlign: "right" }}><span style={{ fontWeight: 600, color: Number(spi) >= 1 ? "var(--color-success)" : "var(--color-danger)" }}>{spi}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
              EVM data is not available for the selected project.
            </div>
          )}
        </div>
      )}

      {activeTab === "Budget" && (
        <div className="rpt-section">
          <div className="rpt-budget-header">
            <div className="rpt-big-stat"><span>{fmt(totalAllocated)}</span><small>Total Allocated</small></div>
            <div className="rpt-big-stat"><span>{fmt(totalSpent)}</span><small>Total Spent</small></div>
            <div className="rpt-big-stat positive"><span>{fmt(totalAllocated - totalSpent)}</span><small>Remaining</small></div>
            <div className="rpt-big-stat positive"><span>{((1 - totalSpent / totalAllocated) * 100).toFixed(1)}%</span><small>Under Budget</small></div>
          </div>
          <div className="card">
            <div className="card-header"><h2>Budget by Project</h2></div>
            <div className="card-body">
              <div className="rpt-hbar-chart">
                {filteredBudget.map((b) => (
                  <div className="rpt-hbar-row" key={b.project}>
                    <div className="rpt-hbar-label">{b.project}</div>
                    <div className="rpt-hbar-tracks">
                      <div className="rpt-hbar-track"><div className="rpt-hbar allocated" style={{ width: `${(b.allocated / budgetMax) * 100}%` }} /></div>
                      <div className="rpt-hbar-track"><div className={`rpt-hbar spent ${b.spent > b.allocated ? "over" : ""}`} style={{ width: `${(b.spent / budgetMax) * 100}%` }} /></div>
                    </div>
                    <div className="rpt-hbar-values"><span>{fmt(b.allocated)}</span><span>{fmt(b.spent)}</span></div>
                  </div>
                ))}
              </div>
              <div className="chart-legend" style={{ marginTop: 14 }}>
                <span><span className="legend-swatch" style={{ background: "var(--green-300)" }} /> Allocated</span>
                <span><span className="legend-swatch" style={{ background: "var(--color-primary)" }} /> Spent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Risks" && (
        <div className="rpt-section">
          <div className="content-grid">
            <div className="card">
              <div className="card-header"><h2>Risk Distribution</h2></div>
              <div className="card-body">
                <div className="rpt-risk-bars">
                  {REPORT_RISKS.map((r) => (
                    <div className="rpt-risk-bar-row" key={r.level}>
                      <span className="rpt-risk-bar-label">{r.level}</span>
                      <div className="rpt-risk-bar-track"><div className="rpt-risk-bar-fill" style={{ width: `${(r.count / riskTotal) * 100}%`, background: r.color }} /></div>
                      <span className="rpt-risk-bar-count">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2>Risk Overview</h2></div>
              <div className="card-body">
                <div className="rpt-status-grid">
                  {REPORT_RISKS.map((r) => (
                    <div key={r.level} className="rpt-status-box" style={{ borderLeft: `4px solid ${r.color}` }}><span>{r.count}</span><small>{r.level}</small></div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Total Risks: <strong>{riskTotal}</strong> &middot; Critical + High: <strong>{REPORT_RISKS[0].count + REPORT_RISKS[1].count}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Delayed Tasks" && (
        <div className="rpt-section">
          <div className="card">
            <div className="card-header"><h2>Delayed Tasks ({filteredDelayed.length})</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Due Date</th><th>Days Late</th></tr></thead>
                  <tbody>
                    {filteredDelayed.map((t, i) => (
                      <tr key={i} className={t.daysLate >= 10 ? "risk-row-critical" : ""}>
                        <td style={{ fontWeight: 600 }}>{t.task}</td>
                        <td>{t.project}</td>
                        <td>{t.assignee}</td>
                        <td className="no-wrap">{formatDate(t.due)}</td>
                        <td><span className={`badge ${t.daysLate >= 10 ? "badge-red" : t.daysLate >= 7 ? "badge-amber" : "badge-green"}`}>{t.daysLate} days</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Safety" && (
        <div className="rpt-section">
          <div className="rpt-safety-stats">
            <div className="rpt-status-box" style={{ background: "#ffebee", borderLeft: "4px solid #e53935" }}><span>{filteredSafety.filter((s) => s.severity === "High").length}</span><small>High Severity</small></div>
            <div className="rpt-status-box" style={{ background: "#fff8e1", borderLeft: "4px solid #f57f17" }}><span>{filteredSafety.filter((s) => s.severity === "Medium").length}</span><small>Medium</small></div>
            <div className="rpt-status-box" style={{ background: "#e8f5e9", borderLeft: "4px solid #2e7d32" }}><span>{filteredSafety.filter((s) => s.severity === "Low").length}</span><small>Low</small></div>
            <div className="rpt-status-box" style={{ background: "#f5f5f5" }}><span>{filteredSafety.length}</span><small>Total Incidents</small></div>
          </div>
          <div className="card">
            <div className="card-header"><h2>Incident Log</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Date</th><th>Project</th><th>Type</th><th>Description</th><th>Severity</th><th>Action Taken</th></tr></thead>
                  <tbody>
                    {filteredSafety.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{s.id}</td>
                        <td className="no-wrap">{formatDate(s.date)}</td>
                        <td>{s.project}</td>
                        <td className="no-wrap">{s.type}</td>
                        <td style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", maxWidth: 200 }}>{s.description}</td>
                        <td><span className={`badge ${severityBadge(s.severity)}`}>{s.severity}</span></td>
                        <td style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", maxWidth: 200 }}>{s.actionTaken}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  );
}

export default Reports;
