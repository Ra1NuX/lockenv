import db from "../db";
import { Projects } from "../models/db";

const getAllProjects = () => {
  const querySelect = db.query<Projects, any>(
    `SELECT project_id as id, name, environment FROM projects`
  );
  const data = querySelect.all();

  return data;
}

export default getAllProjects;