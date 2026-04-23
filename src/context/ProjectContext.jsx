import { createContext, useContext, useState } from "react";
import { PROJECTS } from "../data/sampleData";
import { loadJson, saveJson } from "../utils/storage";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(() =>
    loadJson("conpro:selectedProjectId", null)
  );

  const selectedProject = selectedProjectId
    ? PROJECTS.find((p) => p.id === selectedProjectId) || null
    : null;

  function selectProject(id) {
    setSelectedProjectId(id);
    saveJson("conpro:selectedProjectId", id);
  }

  function clearProject() {
    setSelectedProjectId(null);
    saveJson("conpro:selectedProjectId", null);
  }

  return (
    <ProjectContext.Provider value={{ selectedProject, selectedProjectId, selectProject, clearProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
