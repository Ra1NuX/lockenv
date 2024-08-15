import { cancel, intro, isCancel, select, spinner, text } from "@clack/prompts";
import db from "../../db";
import { Projects } from "../../models/db";
import chalk from "chalk";
import getProjectId from "../getProjectId";
import { projectDataById } from "../getProjectData";

const create = async (name?: string, environment?: string) => {
  try {
    intro(chalk.bgCyan(' Create new project '));
    if(!name) {
      name = await text({
        message: 'What is your project name?',
        placeholder: 'lockenv',
      }) as string;

      if(!name || isCancel(name)) {
        cancel('Name cannot be blank');
        return process.exit(0)
      }

      environment = await select({
        message: 'Pick a project enviroment',
        options: [
          {value: 'beta', label: 'beta'},
          {value: 'prod', label: 'production'}
        ]
      }) as string

      if(isCancel(name) || isCancel(environment) ){
        cancel('Operation cancelled');
        return process.exit(0)
      }
    }
    const s = spinner();
    s.start('Initialization project');

    const id = getProjectId(name, environment);

    if (id) {
      cancel("You have a project with the same name and enviroment");
      return process.exit(0);
    }
  
    const query = db.query<Projects, any>(
      `INSERT INTO projects (name, environment) VALUES (?1, ?2) RETURNING project_id as id`
    );
    const [response] = query.all(name, environment);
    projectDataById.set(response.id, {id: response.id, environment: environment!, name})

    s.stop(`Project ${name} added successfully`);

    return response.id
  } catch (error) {
    console.error(error);
    console.error('Error!')
  }
};

export default create;