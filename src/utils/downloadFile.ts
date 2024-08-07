
import { unlink } from "node:fs/promises";
import { version } from "../../package.json";
import db from "../db";
import { Environments, Projects } from "../models/db";
import chalk from "chalk";
import { cancel, confirm, isCancel, select, spinner } from "@clack/prompts";

const downloadFile = async (project: string|undefined, env: string|undefined, route: string) => {

  const file = Bun.file(route);

  if(await file.exists()){
    const deleteConfirm = confirm({message: 'File exists Do you want to overwrite the file?'});

    if(isCancel(deleteConfirm)) {
      cancel('Exiting process')
      return process.exit(0);
    }
    
    await unlink(route);
  }

  let id: number|null = null;

  if(project && env){
    const projectQuery = db.query<Projects, any>('SELECT project_id as id FROM projects WHERE name=? AND environment=?');
    const projects = projectQuery.all(project, env);
  
    if (projects.length === 0) {
      confirm
      cancel('No project found with the specified name and environment');
      return process.exit(0);
    }
  
    const [tproject] = projects;
    id = tproject.id;
  }

  if(!id) {
    const querySelect = db.query<Projects, any>(
      `SELECT project_id as id, name, environment FROM projects`
    );
    
    const data = querySelect.all();

    if(!data?.length) {
      cancel('No project exists');
      return process.exit(0);
    }

    id = await select({
      message: 'Select a project to download file',
      options: data.map(({id, name, environment}) => ({
        label: `${name} (${environment})`,
        value: id,
        hint: `${environment} is the enviroment`
      }))
    }) as number;

    project = data.find(({id: dataId}) => dataId === id)?.name;
    env = data.find(({id: dataId}) => dataId === id)?.environment;
  }

  const envQuery = db.query<Environments, any>('SELECT key, value FROM environments WHERE project_id=?');
  const data = envQuery.all(id);

  let envData = `# lockenv ${version} · ${project}&${env} \n`

  if (data.length === 0) {
    console.info(chalk.yellow(`No environments found for the specified id: ${id}`));
  } else {
    envData+= data.map((env) => `${env.key}=${env.value}`).join('\n');
  }

  const s = spinner()
  s.start('Downloading File...');

  await Bun.write(route, envData);
  s.stop(`You change to ${project} (${env}) correctly!`);
};

export default downloadFile;