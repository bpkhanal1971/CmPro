import { useState } from "react";
import { DOCUMENTS } from "../data/sampleData";
import { useSettings } from "../context/SettingsContext";
import { useProject } from "../context/ProjectContext";
import { formatDate as fmtDate } from "../utils/formatDate";
import ProjectSelector from "../components/ProjectSelector";
import { loadJson } from "../utils/storage";
import { useGlobalSave } from "../hooks/useGlobalSave";
import "../styles/pages.css";
import "../styles/documents.css";

const CATEGORIES = ["All", "Drawings", "Contracts", "BOQ", "Permits", "Safety Documents", "Reports"];

const FILE_ICONS = { pdf: "\u{1F4C4}", dwg: "\u{1F4D0}", xlsx: "\u{1F4CA}", docx: "\u{1F4DD}", png: "\u{1F5BC}\uFE0F", jpg: "\u{1F5BC}\uFE0F" };
function getIcon(ext) { return FILE_ICONS[ext] || "\u{1F4CE}"; }
function formatSize(kb) { return kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB"; }

const emptyForm = { name: "", category: "Drawings", ext: "pdf" };

function Documents() {
  const { settings } = useSettings();
  const { selectedProject } = useProject();
  const formatDate = (iso) => fmtDate(iso, settings.dateFormat);
  const [docs, setDocs] = useState(() => loadJson("conpro:documents", DOCUMENTS));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useGlobalSave("conpro:documents", docs);

  const keyword = selectedProject ? selectedProject.name.split(" ")[0].toLowerCase() : null;
  const projectDocs = selectedProject
    ? docs.filter((d) =>
        d.name.toLowerCase().includes(keyword) ||
        d.name.toLowerCase().includes(selectedProject.name.toLowerCase().slice(0, 8))
      )
    : docs;

  const filtered = projectDocs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const catCounts = {};
  CATEGORIES.forEach((c) => { catCounts[c] = c === "All" ? projectDocs.length : projectDocs.filter((d) => d.category === c).length; });

  function handleDelete(id) { setDocs(docs.filter((d) => d.id !== id)); }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: "" });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "File name is required.";
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const newId = Math.max(0, ...docs.map((d) => d.id)) + 1;
    const fileName = form.name.includes(".") ? form.name : `${form.name}.${form.ext}`;
    setDocs([{ id: newId, name: fileName, category: form.category, ext: form.ext, size: Math.floor(Math.random() * 4000) + 200, uploadedBy: "You", date: new Date().toISOString().slice(0, 10) }, ...docs]);
    setForm(emptyForm);
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Documents</h1>
        <p>Manage blueprints, contracts, permits, and project files.</p>
      </div>

      <ProjectSelector />

      {!selectedProject && (
        <div className="card" style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--sp-4)" }}>
          Please select a project above to view its documents.
        </div>
      )}

      {selectedProject && <>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button key={c} className={`pill-tab ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>
            {c} <span className="pill-count">{catCounts[c]}</span>
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormErrors({}); setShowModal(true); }}>+ Upload Document</button>
        <div className="search-input-wrap">
          <input type="text" placeholder="Search files or people..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
        </div>
        <span className="filter-count">{filtered.length} files</span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th style={{ width: 40 }}></th><th>File Name</th><th>Category</th><th>Size</th><th>Uploaded By</th><th>Date</th><th style={{ width: 100 }}>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>No documents match your search or filter.</td></tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id}>
                      <td style={{ textAlign: "center", fontSize: "1.2rem" }}>{getIcon(d.ext)}</td>
                      <td><div className="doc-file-name">{d.name}</div><div className="doc-file-ext">.{d.ext}</div></td>
                      <td><span className="doc-cat-badge">{d.category}</span></td>
                      <td className="no-wrap">{formatSize(d.size)}</td>
                      <td>{d.uploadedBy}</td>
                      <td className="no-wrap">{formatDate(d.date)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit" title="Download">&#11015;</button>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDelete(d.id)}>&#128465;</button>
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
      </>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Upload Document</h2><button className="modal-close" onClick={() => setShowModal(false)}>&times;</button></div>
            <form className="modal-form" onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${formErrors.name ? "has-error" : ""}`}>
                <label htmlFor="name">File Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. Plumbing Layout - Level 3" value={form.name} onChange={handleChange} />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ext">File Type</label>
                  <select id="ext" name="ext" value={form.ext} onChange={handleChange}>
                    <option value="pdf">PDF</option><option value="dwg">DWG (Drawing)</option><option value="xlsx">Excel</option><option value="docx">Word</option><option value="png">PNG Image</option><option value="jpg">JPG Image</option>
                  </select>
                </div>
              </div>
              <div className="doc-upload-zone">
                <div className="doc-upload-icon">{"\u{1F4C2}"}</div>
                <p>Drag & drop file here or click to browse</p>
                <span>Supports PDF, DWG, XLSX, DOCX, PNG, JPG</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
