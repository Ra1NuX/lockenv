import { select, confirm, isCancel, cancel, intro} from "@clack/prompts";
import db from "../../db";
import { Projects } from "../../models/db";
import chalk from "chalk";

const _delete = async (selectedId?: number) => {
  console.clear();
  intro(chalk.bgCyan(' Delete existing project '));
  let id = selectedId; 

  if(!id) {
    const querySelect = db.query<Projects, any>(
      `SELECT project_id as id, name, environment FROM projects`
    );
    
    const data = querySelect.all();

    if(!data?.length) {
      cancel('No project exists');
      return process.exit(0);
    }

    id = await select({
      message: 'Select a project to delete',
      options: data.sort( ({name: nameA}, {name: nameB}) => nameA.localeCompare(nameB)).map(({id, name, environment}) => ({
        label: `${name} (${environment})`,
        value: id,
      }))
    }) as number;

    if(!id || isCancel(id)) {
      cancel('Exitting...');
      process.exit(0)
    }
  }

  const querySelect = db.query<Projects, any>(
    `SELECT * FROM projects WHERE project_id=?1`
  );
  const data = querySelect.all(id);

  if (!data.length) {
    cancel(
      "You dont have any project with this ID use lockenv list to check the id tables"
    );
    return process.exit(0);
  }

  const [project] = data;

  const confirmSign = await confirm({
    message: `Are you sure you want delete ${project.name} (${project.environment})?`
  });

  if (isCancel(confirmSign)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  if (confirmSign) {
    const query = db.query(`DELETE FROM projects WHERE project_id = ?`);
    query.run(id!);
  }
  return;
};

export default _delete;