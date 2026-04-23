import { useState } from "react";
import { BUDGET_EXPENSES, BUDGET_PROJECT } from "../data/sampleData";
import { useProject } from "../context/ProjectContext";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";
import "../styles/budget.css";

const emptyForm = { category: "", planned: "", actual: "" };

function fmt(n) {
  return "\u0930\u0942 " + Number(n).toLocaleString("en-IN");
}

function Budget() {
  const { selectedProject } = useProject();
  const [expenses, setExpenses] = useState(() => loadJson("conpro:budgetExpenses", BUDGET_EXPENSES));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useGlobalSave("conpro:budgetExpenses", expenses);

  const totalPlanned = expenses.reduce((s, e) => s + e.planned, 0);
  const totalActual = expenses.reduce((s, e) => s + e.actual, 0);
  const remaining = totalPlanned - totalActual;
  const variance = totalPlanned - totalActual;
  const variancePct = totalPlanned ? ((variance / totalPlanned) * 100).toFixed(1) : 0;
  const chartMax = Math.max(...expenses.map((e) => Math.max(e.planned, e.actual)));

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function validate() {
    const errs = {};
    if (!form.category.trim()) errs.category = "Category is required.";
    if (!form.planned || Number(form.planned) <= 0) errs.planned = "Enter a valid planned cost.";
    if (!form.actual || Number(form.actual) < 0) errs.actual = "Enter a valid actual cost.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const newId = Math.max(0, ...expenses.map((x) => x.id)) + 1;
    setExpenses([...expenses, { id: newId, category: form.category, planned: Number(form.planned), actual: Number(form.actual) }]);
    setForm(emptyForm);
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Budget</h1>
        <p>Cost tracking and financial overview.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
          Please select a project above to view its budget.
        </div>
      )}

      {selectedProject && selectedProject.name !== "Kathmandu Business Park" && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
          Detailed budget data for {selectedProject.name} is not yet available. Detailed budget breakdown is currently available for Kathmandu Business Park.
        </div>
      )}

      {selectedProject && selectedProject.name === "Kathmandu Business Park" && <>
      <div className="summary-grid">
        <div className="summary-card budget-card">
          <div><div className="summary-label">Estimated Cost</div><div className="summary-value">{fmt(totalPlanned)}</div></div>
        </div>
        <div className="summary-card budget-card spent">
          <div><div className="summary-label">Actual Cost</div><div className="summary-value">{fmt(totalActual)}</div></div>
        </div>
        <div className={`summary-card budget-card ${remaining >= 0 ? "positive" : "negative"}`}>
          <div><div className="summary-label">Remaining Budget</div><div className="summary-value">{fmt(Math.abs(remaining))}</div><div className="summary-sub">{remaining >= 0 ? "Under budget" : "Over budget"}</div></div>
        </div>
        <div className={`summary-card budget-card ${variance >= 0 ? "positive" : "negative"}`}>
          <div><div className="summary-label">Cost Variance</div><div className="summary-value">{variance >= 0 ? "+" : "-"}{variancePct}%</div><div className="summary-sub">{variance >= 0 ? "Savings" : "Overrun"}</div></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2>Budget vs Actual by Category</h2></div>
        <div className="card-body">
          <div className="budget-chart">
            {expenses.map((e) => {
              const plannedPct = (e.planned / chartMax) * 100;
              const actualPct = (e.actual / chartMax) * 100;
              const over = e.actual > e.planned;
              return (
                <div className="budget-chart-row" key={e.id}>
                  <div className="budget-chart-label">{e.category}</div>
                  <div className="budget-chart-bars">
                    <div className="budget-bar-track"><div className="budget-bar planned" style={{ width: `${plannedPct}%` }} title={`Planned: ${fmt(e.planned)}`} /></div>
                    <div className="budget-bar-track"><div className={`budget-bar actual ${over ? "over" : ""}`} style={{ width: `${actualPct}%` }} title={`Actual: ${fmt(e.actual)}`} /></div>
                  </div>
                  <div className={`budget-chart-variance ${over ? "negative" : "positive"}`}>{over ? "-" : "+"}{fmt(Math.abs(e.planned - e.actual))}</div>
                </div>
              );
            })}
          </div>
          <div className="budget-chart-legend">
            <span><span className="legend-bar planned" /> Planned</span>
            <span><span className="legend-bar actual" /> Actual</span>
            <span><span className="legend-bar over" /> Over Budget</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormErrors({}); setShowModal(true); }}>+ Add Expense</button>
        <span className="filter-count">{expenses.length} categories</span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Category</th><th style={{ textAlign: "right" }}>Planned Cost</th><th style={{ textAlign: "right" }}>Actual Cost</th><th style={{ textAlign: "right" }}>Variance</th><th>Usage</th></tr></thead>
              <tbody>
                {expenses.map((e) => {
                  const v = e.planned - e.actual;
                  const pct = e.planned ? ((e.actual / e.planned) * 100).toFixed(0) : 0;
                  const over = e.actual > e.planned;
                  return (
                    <tr key={e.id} className={over ? "risk-row-critical" : ""}>
                      <td style={{ fontWeight: 600 }}>{e.category}</td>
                      <td style={{ textAlign: "right" }} className="no-wrap">{fmt(e.planned)}</td>
                      <td style={{ textAlign: "right" }} className="no-wrap">{fmt(e.actual)}</td>
                      <td style={{ textAlign: "right" }} className="no-wrap">
                        <span style={{ color: over ? "var(--color-danger)" : "var(--color-success)", fontWeight: 600 }}>{over ? "-" : "+"}{fmt(Math.abs(v))}</span>
                      </td>
                      <td style={{ minWidth: 130 }}>
                        <div className="progress-bar"><div className={`progress-fill ${over ? "over" : "green"}`} style={{ width: `${Math.min(Number(pct), 100)}%` }} /></div>
                        <span style={{ fontSize: "0.72rem", color: over ? "var(--color-danger)" : "var(--color-text-muted)" }}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="budget-total-row">
                  <td style={{ fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }} className="no-wrap">{fmt(totalPlanned)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }} className="no-wrap">{fmt(totalActual)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }} className="no-wrap">
                    <span style={{ color: variance >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>{variance >= 0 ? "+" : "-"}{fmt(Math.abs(variance))}</span>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Expense Category</h2><button className="modal-close" onClick={() => setShowModal(false)}>&times;</button></div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.category ? "has-error" : ""}`}>
                <label htmlFor="category">Category Name</label>
                <input id="category" name="category" type="text" placeholder="e.g. Landscaping" value={form.category} onChange={handleChange} />
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </div>
              <div className="form-row">
                <div className={`form-group ${formErrors.planned ? "has-error" : ""}`}>
                  <label htmlFor="planned">Planned Cost (\u0930\u0942)</label>
                  <input id="planned" name="planned" type="number" min="0" placeholder="e.g. 5000000" value={form.planned} onChange={handleChange} />
                  {formErrors.planned && <span className="field-error">{formErrors.planned}</span>}
                </div>
                <div className={`form-group ${formErrors.actual ? "has-error" : ""}`}>
                  <label htmlFor="actual">Actual Cost (\u0930\u0942)</label>
                  <input id="actual" name="actual" type="number" min="0" placeholder="e.g. 4800000" value={form.actual} onChange={handleChange} />
                  {formErrors.actual && <span className="field-error">{formErrors.actual}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;
