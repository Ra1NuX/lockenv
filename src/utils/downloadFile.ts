
import { unlink } from "node:fs/promises";
import { version } from "../../package.json";
import db from "../db";
import { Environments, Projects } from "../models/db";
import chalk from "chalk";

const downloadFile = async (project: string, env: string, route: string) => {

  const file = Bun.file(route);

  if(await file.exists()){
    const deleteConfirm = confirm('File exists Do you want to overwrite the file?');
    if(deleteConfirm) {
      await unlink(route);
    }else {
      return;
    }
  }

  const projectQuery = db.query<Projects, any>('SELECT project_id as id FROM projects WHERE name=? AND environment=?');
  const projects = projectQuery.all(project, env);

  if (projects.length === 0) {
    console.error('No project found with the specified name and environment');
    return;
  }

  const [{ id }] = projects;

  const envQuery = db.query<Environments, any>('SELECT key, value FROM environments WHERE project_id=?');
  const data = envQuery.all(id);

  let envData = `# lockenv ${version} · ${project}&${env} \n`

  if (data.length === 0) {
    console.info(chalk.yellow(`No environments found for the specified id: ${id}`));
  } else {
    envData+= data.map((env) => `${env.key}=${env.value}`).join('\n');
  }

  await Bun.write(route, envData);
  console.log(`You change to ${project} (${env}) correctly!`);
};

export default downloadFile;