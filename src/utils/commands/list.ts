import { cancel, intro, isCancel, select } from "@clack/prompts";
import db from "../../db";
import { Environments, Projects } from "../../models/db";
import chalk from "chalk";
import getAllProjects from "../getAllProjects";

const list = async (selectedId?: number) => {
  try {
    intro(chalk.bgCyan(' List of projects '))
    let id = selectedId;

    if(!id) {
      const projects = getAllProjects();
      if (!projects.length) {
        cancel(
          "There is no project yet. To create a new project use: lockenv create project <name>"
        );
        return process.exit(0);
      }

      const enviromentsQuery = db.query<Environments, any>(
        `SELECT * FROM environments`
      );
      const environments = enviromentsQuery.all();
  
      const envsByProject = new Map<number, { key: string; value: string }[]>();
  
      for (let i = 0; i < environments.length; i++) {
        const env = environments[i];
        const projectEnvs = envsByProject.get(env.project_id);
        if (!projectEnvs) {
          envsByProject.set(env.project_id, [{ key: env.key, value: env.value }]);
        } else {
          projectEnvs.push({
            key: env.key,
            value: env.value,
          });
        }
      }
  
      const rowsWithEnvs = projects.map(({ environment, id, name }) => {
        const environmentForThisProject = envsByProject.get(id);
        if (environmentForThisProject) {
          let envs = environmentForThisProject
            .map(({ key, value }, index) => index < 3 && `${key}=${value}`)
            .filter(Boolean)
            .join(`, `);
  
          if (environmentForThisProject.length > 3) {
            envs += `... (${environmentForThisProject.length - 3} more)`;
          }
  
          return {
            id,
            name,
            environment,
            envs,
          };
        } else {
          return {
            id,
            name,
            environment,
          };
        }
      });
  

      id = await select({
        message: 'Select a project',
        options: rowsWithEnvs.sort((a, b) => a.name.localeCompare(b.name)).map(({environment, id, name, envs}) => ({label: `${name} (${environment})`, value: id, hint: envs})),
      }) as number;

      if(isCancel(id)){
        cancel('Exitting...')
        process.exit(0);
      }
    }
    
    if (id) {
      const enviromentsQuery = db.query<Environments, any>(
        `SELECT * FROM environments WHERE project_id = ?1`
      );
      const environments = enviromentsQuery.all(id);

      if(!environments?.length) {
        cancel('There are no enviroments for this project yet');
        return process.exit(0)
      }

      const rows = environments.map(({ key, value }) => `${key}=${value}`);
      console.table(rows);
      return;
    }

  } catch (error) {
    console.error("Error querying projects:", error);
  }
};

export default list;