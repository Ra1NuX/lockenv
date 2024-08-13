import db from "../../db";
import { Environments, Projects } from "../../models/db";

const add = (
  key: string,
  value: string,
  { project, environment }: { project: string; environment: string }
) => {
  
  const projectQuery = db.prepare<Projects, any>(
    "SELECT project_id as id FROM projects WHERE name = ? AND environment = ?"
  );

  const data = projectQuery.get(project, environment);

  if (data) {
    const environmentQuery = db.prepare<Environments, any>(
      `INSERT INTO environments (project_id, key, value)
       SELECT project_id as id, ?, ?
       FROM projects
       WHERE project_id = ?
       RETURNING id`
    );
    const [project] = environmentQuery.all(key, value, data.id);

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