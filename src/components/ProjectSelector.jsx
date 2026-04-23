import { PROJECTS } from "../data/sampleData";
import { useProject } from "../context/ProjectContext";

export default function ProjectSelector() {
  const { selectedProjectId, selectProject, clearProject, selectedProject } = useProject();

  return (
    <div className="project-selector-bar">
      <label className="project-selector-label">Project:</label>
      <select
        className="project-selector-dropdown"
        value={selectedProjectId || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") clearProject();
          else selectProject(Number(val));
        }}
      >
        <option value="">— Select a Project —</option>
        {PROJECTS.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      {selectedProject && (
        <span className="project-selector-info">
          {selectedProject.location} — {selectedProject.client}
        </span>
      )}
    </div>
  );
}
