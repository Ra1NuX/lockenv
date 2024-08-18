import db from "../../db";
import { Config } from "../../models/config";
import { Environments, Projects } from "../../models/db";
import getProjectId from "../getProjectId";
import logger from "../logger";

const add = (key: string, value: string, { force, ...config }: Config) => {
  let id;

  if ("id" in config) {
    id = config.id;
  } else {
    const { project, environment } = config;
    id = getProjectId(project, environment);
  }

  if (!id) {
    logger.cancel("Something went wrong");
    return;
  }

  const environmentQuery = db.prepare<Environments, any>(
    `INSERT INTO environments (project_id, key, value)
       SELECT project_id, ?, ?
       FROM projects
       WHERE project_id = ?
       RETURNING id, project_id, key, value`
  );

  const [enviroment] = environmentQuery.all(key, value, id);

  if (enviroment?.project_id) {
    return enviroment.project_id;
  }
  
  logger.cancel("Something went wrong");

};

export default add;
