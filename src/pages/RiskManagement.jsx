import { useState } from "react";
import { RISKS, PEOPLE } from "../data/sampleData";
import { useProject } from "../context/ProjectContext";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";
import "../styles/risk.css";

const PROB_LABELS = ["Very Low", "Low", "Medium", "High", "Very High"];
const IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Severe"];
const STATUS_OPTIONS = ["Open", "Mitigating", "Closed"];

function scoreLevel(score) {
  if (score >= 16) return "critical";
  if (score >= 9) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function scoreBadge(score) {
  return { critical: "badge-red", high: "badge-amber", medium: "badge-green", low: "badge-blue" }[scoreLevel(score)];
}

function scoreLabel(score) {
  return { critical: "Critical", high: "High", medium: "Medium", low: "Low" }[scoreLevel(score)];
}

function statusBadge(s) {
  return { Open: "badge-red", Mitigating: "badge-amber", Closed: "badge-green" }[s] || "badge-gray";
}

const emptyForm = { title: "", description: "", probability: 3, impact: 3, mitigation: "", owner: PEOPLE[0], status: "Open" };

function RiskManagement() {
  const { selectedProject } = useProject();
  const [risks, setRisks] = useState(() => loadJson("conpro:risks", RISKS));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [filterLevel, setFilterLevel] = useState("all");

  useGlobalSave("conpro:risks", risks);

  const keyword = selectedProject ? selectedProject.name.split(" ")[0].toLowerCase() : null;
  const projectRisks = selectedProject
    ? risks.filter((r) =>
        r.title.toLowerCase().includes(keyword) ||
        r.description.toLowerCase().includes(keyword) ||
        r.mitigation.toLowerCase().includes(keyword)
      )
    : risks;

  const filtered = projectRisks.filter((r) => filterLevel === "all" || scoreLevel(r.probability * r.impact) === filterLevel);

  const summary = {
    total: projectRisks.length,
    critical: projectRisks.filter((r) => scoreLevel(r.probability * r.impact) === "critical").length,
    high: projectRisks.filter((r) => scoreLevel(r.probability * r.impact) === "high").length,
    open: projectRisks.filter((r) => r.status === "Open").length,
  };

  function handleChange(e) {
    const val = e.target.name === "probability" || e.target.name === "impact" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Risk title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.mitigation.trim()) errs.mitigation = "Mitigation plan is required.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const newId = `R-${String(risks.length + 1).padStart(3, "0")}`;
    setRisks([...risks, { id: newId, ...form }]);
    setForm(emptyForm);
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Risk Management</h1>
        <p>Identify, assess, and mitigate project risks.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--sp-4)" }}>
          Please select a project above to view its risks.
        </div>
      )}

      {selectedProject && <>
      <div className="summary-grid">
        <div className="summary-card risk-summary-card">
          <div><div className="summary-value">{summary.total}</div><div className="summary-label">Total Risks</div></div>
        </div>
        <div className="summary-card risk-summary-card critical">
          <div><div className="summary-value">{summary.critical}</div><div className="summary-label">Critical</div></div>
        </div>
        <div className="summary-card risk-summary-card high">
          <div><div className="summary-value">{summary.high}</div><div className="summary-label">High</div></div>
        </div>
        <div className="summary-card risk-summary-card open">
          <div><div className="summary-value">{summary.open}</div><div className="summary-label">Open</div></div>
        </div>
      </div>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormErrors({}); setShowModal(true); }}>+ Add Risk</button>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="filter-count">{filtered.length} risks</span>
      </div>

      <div className="risk-matrix-legend">
        <span>Risk Score = Probability &times; Impact</span>
        <span className="risk-dot critical" /> 16-25 Critical
        <span className="risk-dot high" /> 9-15 High
        <span className="risk-dot medium" /> 4-8 Medium
        <span className="risk-dot low" /> 1-3 Low
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Risk Title</th><th>Description</th><th>Prob.</th><th>Impact</th><th>Score</th><th>Mitigation Plan</th><th>Owner</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>No risks match the selected filter.</td></tr>
                ) : (
                  filtered.map((r) => {
                    const score = r.probability * r.impact;
                    const lvl = scoreLevel(score);
                    return (
                      <tr key={r.id} className={lvl === "critical" ? "risk-row-critical" : ""}>
                        <td className="no-wrap" style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{r.id}</td>
                        <td style={{ fontWeight: 600, minWidth: 140 }}>{r.title}</td>
                        <td className="risk-desc-cell">{r.description}</td>
                        <td style={{ textAlign: "center" }}><span className="risk-num">{r.probability}</span><span className="risk-sublabel">{PROB_LABELS[r.probability - 1]}</span></td>
                        <td style={{ textAlign: "center" }}><span className="risk-num">{r.impact}</span><span className="risk-sublabel">{IMPACT_LABELS[r.impact - 1]}</span></td>
                        <td style={{ textAlign: "center" }}><span className={`badge ${scoreBadge(score)}`}>{score} \u2014 {scoreLabel(score)}</span></td>
                        <td className="risk-desc-cell">{r.mitigation}</td>
                        <td className="no-wrap">{r.owner}</td>
                        <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Add New Risk</h2><button className="modal-close" onClick={() => setShowModal(false)}>&times;</button></div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.title ? "has-error" : ""}`}>
                <label htmlFor="title">Risk Title</label>
                <input id="title" name="title" type="text" placeholder="e.g. Foundation settlement risk" value={form.title} onChange={handleChange} />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>
              <div className={`form-group ${formErrors.description ? "has-error" : ""}`}>
                <label htmlFor="description">Description</label>
                <input id="description" name="description" type="text" placeholder="Describe the risk in detail" value={form.description} onChange={handleChange} />
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="probability">Probability (1-5)</label>
                  <select id="probability" name="probability" value={form.probability} onChange={handleChange}>
                    {PROB_LABELS.map((l, i) => <option key={i} value={i + 1}>{i + 1} \u2014 {l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="impact">Impact (1-5)</label>
                  <select id="impact" name="impact" value={form.impact} onChange={handleChange}>
                    {IMPACT_LABELS.map((l, i) => <option key={i} value={i + 1}>{i + 1} \u2014 {l}</option>)}
                  </select>
                </div>
              </div>
              <div className="risk-score-preview">
                Risk Score: <strong>{form.probability * form.impact}</strong> \u2014 <span className={`badge ${scoreBadge(form.probability * form.impact)}`}>{scoreLabel(form.probability * form.impact)}</span>
              </div>
              <div className={`form-group ${formErrors.mitigation ? "has-error" : ""}`}>
                <label htmlFor="mitigation">Mitigation Plan</label>
                <input id="mitigation" name="mitigation" type="text" placeholder="How will this risk be mitigated?" value={form.mitigation} onChange={handleChange} />
                {formErrors.mitigation && <span className="field-error">{formErrors.mitigation}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="owner">Owner</label>
                  <select id="owner" name="owner" value={form.owner} onChange={handleChange}>
                    {PEOPLE.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskManagement;
