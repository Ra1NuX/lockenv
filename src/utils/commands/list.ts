import { isCancel, select } from "@clack/prompts";
import db from "../../db";
import { Environments, Projects } from "../../models/db";
import getAllProjects from "../getAllProjects";
import { Config } from "../../models/config";
import logger from "../logger";
import getProjectId from "../getProjectId";
import chalk from "chalk";
import selectProjectId from "../selectProjectId";

const list = async ({ force, silent, ...config }: Config) => {
  try {
    logger.setConfig({ silent, force });
    logger.intro("List of projects");

    let id;
    if ("id" in config) {
      id = config.id;
    } else {
      id = getProjectId(config.project, config.environment);
    }

    if (!id) {
      const projects = getAllProjects();
      if (!projects.length) {
        logger.cancel(
          "There is no project yet. To create a new project use: lockenv create project <name>"
        );
        return;
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
          envsByProject.set(env.project_id, [
            { key: env.key, value: env.value },
          ]);
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

      id = await selectProjectId();

      if (isCancel(id) || !id) {
        return;
      }
    }

    const enviromentsQuery = db.query<Environments, any>(
      `SELECT * FROM environments WHERE project_id = ?1`
    );
    const environments = enviromentsQuery.all(id);

    if (!environments?.length) {
      logger.cancel("There are no enviroments for this project yet");
      return;
    }

    const rows = environments.map(
      ({ key, value }) => `${chalk.blue(key)}=${chalk.gray('"' + value + '"')}`
    );
    logger.table(rows);
    return;
    
  } catch (error) {
    logger.error(`"Error querying projects: ${error}`);
  }
};

export default list;
