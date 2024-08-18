import { isCancel, select } from "@clack/prompts";
import getAllProjects from "./getAllProjects";
import logger from "./logger";
import { LoggerConfig } from "../models/config";
import create from "./commands/create";

const selectProjectId = async (
  config?: {
    withCreated?: boolean;
    title?: string;
    initialValue?: number;
  } & LoggerConfig
) => {
  const projects = getAllProjects();

  let withCreated = config?.withCreated
  let title = config?.title
  let initialValue = config?.initialValue
  let silent = config?.silent
  let force = config?.force
  
  logger.setConfig({ force, silent });
  const options = projects
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, environment }) => ({
      label: `${name} (${environment})`,
      value: id,
    }));

  if (withCreated) {
    options.push({
      value: -1,
      label: "Create new project",
    });
  }

  let id: number | undefined = (await select({
    message: title ?? "Select a project",
    options,
    initialValue,
  })) as number;

  if (isCancel(id) || !id) {
    logger.cancel("Exiting...");
    return;
  }

  if (withCreated && id === -1) {
    id = await create({ silent, force });
  }
  if (isCancel(id) || !id) {
    return;
  }

  return id;
};

export default selectProjectId;
