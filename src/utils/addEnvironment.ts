import db from "../db";
import { Projects } from "../models/db";

const addEnvironment = (
  key: string,
  value: string,
  { project, environment }: { project: string; environment: string }
) => {
  // Query to get the project_id based on project name and environment
  const projectQuery = db.prepare<Projects, any>(
    "SELECT project_id as id FROM projects WHERE name = ? AND environment = ?"
  );

  // Fetch the project_id
  const data = projectQuery.get(project, environment);
  console.log(project, environment);

  if (data) {
    const environmentQuery = db.prepare(
      `INSERT INTO environments (project_id, key, value)
       SELECT project_id, ?, ?
       FROM projects
       WHERE project_id = ?`
    );
    const response = environmentQuery.run(key, value, data.id);

    if (response.changes) {
      console.log("OK!");
    } else {
      console.log("Something went wrong :(");
    }
  } else {
    console.log("No matching project found.");
  }
};

export default addEnvironment;