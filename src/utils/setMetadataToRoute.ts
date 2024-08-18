import { Config } from "../models/config";
import checkMetadata from "./checkMetadata";
import createMetadata from "./createMetadata";
import getProjectData from "./getProjectData";

import { unlink } from "node:fs/promises";

const setMetadataToRoute = async ({route, ...config}: Partial<Config>) => {
  const file = Bun.file(route!);

  let project;
  let environment;

  if('id' in config) {
    const p = getProjectData(config.id!);
    if(!p) return;
    project = p.name,
    environment = p.environment
  } else if('project' in config) {
    project = config.project;
    environment = config.environment
  }

  const exist = await file.exists();
  if(!exist) return;
  let text; 
  
  text = await file.text();
  const { version } = checkMetadata(text);
  if(!version) {
    const metadata = createMetadata(project!, environment!);
    text = metadata + text;
  }

  await unlink(route!);
  await Bun.write(route!, text)

}

export default setMetadataToRoute;