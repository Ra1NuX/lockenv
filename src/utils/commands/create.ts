import { isCancel, select, spinner, text } from "@clack/prompts";
import db from "../../db";
import { Projects } from "../../models/db";
import getProjectId from "../getProjectId";
import { projectDataById } from "../getProjectData";
import { CommonConfig, ConfigByName } from "../../models/config";
import logger from "../logger";
import chalk from "chalk";

const create = async (config?: Partial<ConfigByName & CommonConfig>) => {
  try {

    let project = config?.project;
    let environment = config?.environment;
    
    logger.setConfig({ silent: config?.silent, force: config?.force });
    logger.intro('Create new project');

    if(!project) {
      project = await text({
        message: 'What is your project name?',
        placeholder: 'lockenv',
      }) as string;

      if(!project || isCancel(project)) {
        logger.cancel("Project name can't be blank");
        return
      }

      environment = await select({
        message: 'Pick a project enviroment',
        options: [
          {value: 'beta', label: 'beta'},
          {value: 'prod', label: 'production'}
        ]
      }) as string

      if(!environment || isCancel(environment) ){
        logger.cancel("Project enviroment can't be blank");
        return
      }
    }
    
    const id = getProjectId(project, environment);
    if (id) {
      logger.cancel("You have a project with the same name and enviroment");
      return
    }
  
    const query = db.query<Projects, any>(
      `INSERT INTO projects (name, environment) VALUES (?1, ?2) RETURNING project_id as id`
    );
    const [response] = query.all(project, environment);
    projectDataById.set(response.id, {id: response.id, environment: environment!, name: project })

    logger.outro(chalk.greenBright(`+ ${chalk.yellow('"'+project+'"')} added successfully!`));

    return response.id
  } catch (ex) {
    const { message, stack } = ex as Error;
    logger.error(message??stack);
  }
};

export default create;