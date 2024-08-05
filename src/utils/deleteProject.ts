import db from "../db";
import { Projects } from "../models/db";

const deleteProject = (id: number) => {
  const querySelect = db.query<Projects, any>(
    `SELECT * FROM projects WHERE project_id=?1`
  );
  const data = querySelect.all(id);

  if (!data.length) {
    console.error(
      "You dont have any project with this ID use lockenv list to check the id tables"
    );
    return;
  }

  const [project] = data;

  const confirmSign = confirm(
    `Are you sure you want delete ${project.name} (${project.environment})?`
  );
  if (confirmSign) {
    const query = db.query(`DELETE FROM projects WHERE project_id = ?`);
    query.run(id);
  }
  return;
};

export default deleteProject;