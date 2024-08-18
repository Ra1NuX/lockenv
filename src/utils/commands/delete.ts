import { isCancel } from "@clack/prompts";
import db from "../../db";
import getAllProjects from "../getAllProjects";
import { Config } from "../../models/config";
import getProjectId from "../getProjectId";
import getProjectData, { projectDataById } from "../getProjectData";
import logger from "../logger";
import selectProjectId from "../selectProjectId";
import chalk from "chalk";

const _delete = async ({ force, silent, ...config }: Config) => {
  try {
    logger.setConfig({ silent, force });
    logger.intro('Delete project')
    let id;

    if ("id" in config) {
      id = config.id;
    } else {
      id = getProjectId(config.project, config.environment);
    }

    if (!id) {
      const projects = getAllProjects();

      if (!projects?.length) {
        logger.cancel("You haven't any projects yet");
        return;
      }

      id = await selectProjectId({
        title: "Select a project to delete",
      })

      if (!id || isCancel(id)) {
        return;
      }
    }

    const project = getProjectData(id);
    if (!project) {
      logger.cancel(
        "You dont have any project with this ID use lockenv list to check the id tables"
      );
      return;
    }

    const confirmSign = await logger.confirm({
      message: `Are you sure you want delete ${project.name} (${project.environment})?`,
    });

    if (isCancel(confirmSign) || !confirmSign) {
      logger.cancel("Operation cancelled");
      return;
    }

    const query = db.query(`DELETE FROM projects WHERE project_id = ?`);
    query.run(id!);
    projectDataById.delete(id);

    logger.outro(chalk.greenBright(`${chalk.yellow('"'+project.name+'"')} was successfully eliminated!`));
  } catch (ex) {
    const { message, stack } = ex as Error;
    logger.error(message ?? stack);
  }
};

export default _delete;
