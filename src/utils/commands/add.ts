import db from "../../db";
import { Environments, Projects } from "../../models/db";
import getProjectId from "../getProjectId";

const add = (
  key: string,
  value: string,
  { project, environment }: { project: string; environment: string }
) => {
  
  const id = getProjectId(project, environment);

  if (id) {
    const environmentQuery = db.prepare<Environments, any>(
      `INSERT INTO environments (project_id, key, value)
       SELECT project_id as id, ?, ?
       FROM projects
       WHERE project_id = ?
       RETURNING id`
    );
    const [project] = environmentQuery.all(key, value, id);

    if (project?.id) {
      return project.id
    } else {
      console.log("Something went wrong :(");
    }
  } else {
    console.log("No matching project found.");
  }
};

export default add;