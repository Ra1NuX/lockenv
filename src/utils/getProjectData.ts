import db from "../db";
import { Projects } from "../models/db";

export const projectDataById = new Map<number, Projects>();

const getProjectData = (id: number): Projects | undefined => {
  try {
    const project = projectDataById.get(id);

    if (project) return project;

    const query = db.query<Projects, any>(
      `SELECT project_id as id, name, environment FROM projects WHERE id=?`
    );
    const [data] = query.all(id);

    if (data) {
      projectDataById.set(id, data);
      return data;
    }

    throw Error('There are no projects with this ID');
  } catch (ex) {
    const {message, stack} = ex as Error;
    console.log(message??stack)
  }
};

export default getProjectData;
