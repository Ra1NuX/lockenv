import { cancel } from "@clack/prompts";
import db from "../db";
import { Projects } from "../models/db";
import { projectDataById } from "./getProjectData";

const getProjectId = (name?: string, env?: string) => {

  if(!name||!env) return;

  for (let [id, project] of projectDataById.entries()) {
    if (project.name === name && project.environment === env) {
      return id;
    }
  }

  const projectQuery = db.query<Projects, any>(
    "SELECT project_id as id FROM projects WHERE name=? AND environment=?"
  );
  const projects = projectQuery.all(name, env);

  if (projects.length === 0) {
    cancel("No project found with the specified name and environment");
    return;
  }

  const [project] = projects;

  projectDataById.set(project.id, project);
  return project.id;

};

export default getProjectId;