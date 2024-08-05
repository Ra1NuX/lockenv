import db from "../db";
import { Projects } from "../models/db";

const createProject = (name: string, environment: string) => {
  try {
    const querySelect = db.query(
      `SELECT * FROM projects WHERE name=?1 AND environment = ?2`
    );
    const data = querySelect.all(name, environment);
    if (data.length) {
      console.error("You have a project with the same name and enviroment");
      return;
    }
  
    const query = db.query<Projects, any>(
      `INSERT INTO projects (name, environment) VALUES (?1, ?2) RETURNING project_id as id`
    );
    const [response] = query.all(name, environment);
    console.log(`project ${name} added successfully`);

    return response.id
  } catch (error) {
    console.error(error);
    console.error('Error!')
  }
};

export default createProject;