import {
  isCancel,
  select,
} from "@clack/prompts";
import { unlink } from "node:fs/promises";

import { Environments } from "../../models/db";
import checkMetadata from "../checkMetadata";
import push from "./push";
import db from "../../db";
import create from "./create";
import getProjectData, { projectDataById } from "../getProjectData";
import getProjectId from "../getProjectId";
import getAllProjects from "../getAllProjects";
import logger from "../logger";
import { BasicConfig, Config } from "../../models/config";
import createMetadata from "../createMetadata";
import selectProjectId from "../selectProjectId";
import chalk from "chalk";

const pull = async (config: Config, callbackProject?: BasicConfig) => {
  try {
    logger.setConfig({ silent: config.silent, force: config.force });
    logger.intro("Pull enviroments");

    let sourceEnviroment: string, sourceProject: string;

    if (!config.route) return;
    const file = Bun.file(config.route);
    let text;

    if (await file.exists()) {
      text = await file.text();

      const pullConfirm = await logger.confirm({
        message: `You have a file in route ${config.route}. Do you want to save actual enviroments?`,
      });

      if (isCancel(pullConfirm)) {
        logger.cancel('Exitting...');
        return;
      }

      if(pullConfirm) {

      const { project: p, environment: e } = checkMetadata(text ?? "");

      if (p && e) {
        sourceEnviroment = e;
        sourceProject = p;
        await push({
          project: sourceProject,
          environment: sourceEnviroment,
          route: config.route,
          silent: config.silent,
          force: config.force,
        });
        
      } else {
        logger.intro("Create a new project to save your data");
        const id = await create({
          ...callbackProject,
          silent: config.silent,
          force: config.force,
        });
        if (id) {
          const newCreatedProject = projectDataById.get(id);
          if (newCreatedProject) {
            await push({
              project: newCreatedProject.name,
              environment: newCreatedProject.environment,
              route: config.route,
              silent: config.silent,
              force: config.force,
            });
           
          }
        } else {
          logger.cancel("Something went wrong we can't create a project");
        }
      }
    }
    }

    let id: number | undefined;
    let project: string;
    let env: string;

    if ("id" in config) {
      id = config.id;
    } else {
      id = getProjectId(config.project, config.environment);
    }

    if (!id) {
      const projects = getAllProjects();

      if (!projects?.length) {
        const newProject = await logger.confirm({
          message: `You don't have a projects yet, Do you want to create a new project?`,
        });
        if (newProject) {
          id = (await create(config)) as number;

          const projectData = getProjectData(id);
          if (!projectData) return;

          project = projectData.name;
          env = projectData.environment;
        }
      } else if (callbackProject) {
        if ("id" in callbackProject) {
          const data = getProjectData(callbackProject.id);
          if (!data) return;

          project = data.name;
          env = data.environment;
        } else {
          project = callbackProject.project;
          env = callbackProject.environment;
        }
      } else {

        const initialValue = projects.find(
          ({ environment, name }) =>
            sourceProject === name && environment === sourceEnviroment
        )?.id
        id = await selectProjectId({title: 'Select a project', initialValue, withCreated: false, silent: config.silent, force: config.force})

        if(isCancel(id) || !id) {
          return;
        }

        const data = getProjectData(id);
        if (!data) return;

        project = data.name;
        env = data.environment;
      }
    }

    const envQuery = db.query<Environments, any>(
      "SELECT key, value FROM environments WHERE project_id=?"
    );
    const data = envQuery.all(id);

    let envData = createMetadata(project!, env!)
    if (data.length !== 0) {
      envData += data.map((env) => `${env.key}="${env.value}"`).join("\n");
    }
    await unlink(config.route);
    await Bun.write(config.route, envData);
    logger.outro(chalk.greenBright(`You change to ${chalk.yellow(`"${project!} (${env!})"`)} correctly!`));
  } catch (ex) {
    const { message, stack } = ex as Error;
    logger.error(message ?? stack);
  }
};

export default pull;
