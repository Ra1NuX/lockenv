
import { cancel, confirm, intro, isCancel, outro, select, spinner } from "@clack/prompts";
import { unlink } from "node:fs/promises";
import chalk from "chalk";

import { version } from "../../../package.json";

import { Environments, Projects } from "../../models/db";
import checkMetadata from "../checkMetadata";
import push from "./push";
import db from "../../db";
import create from "./create";

const pull = async (project: string|undefined, env: string|undefined, route: string) => {
  intro(chalk.bgCyan(` Pull enviroments `));

  let sourceEnviroment: string, sourceProject: string;

  const file = Bun.file(route);
  let text; 

  if(await file.exists()){
    text = await file.text()
    const pullConfirm = await confirm({message: `You have a file in route ${route}. Do you want to save actual enviroments?`});

    if(isCancel(pullConfirm)) {
      cancel('Exiting process')
      return process.exit(0);
    }

    if(pullConfirm) {
      const s = spinner()
      s.message('Saving actual project')
      s.start()
      const { project: p, environment:e } = checkMetadata(text??'');

      if(p && e) {
        sourceEnviroment = e; 
        sourceProject = p;
        await push(sourceProject, sourceEnviroment, route);
        s.stop(`Enviroments saved in ${sourceProject} (${sourceEnviroment})`)
      }
    }
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
      const newProject = await confirm({message: `You don't have a projects yet, Do you want to create a new project?`});
      if(newProject) {
        await create();
      }
    }

    id = await select({
      message: 'Select a project',
      initialValue: data.find(({environment, name}) => sourceProject === name && environment === sourceEnviroment )?.id,
      options: data.sort((a,b) => a.name.localeCompare(b.name) ).map(({id, name, environment}) => ({
        label: `${name} (${environment})`,
        value: id,
      }))
    }) as number;

    project = data.find(({id: dataId}) => dataId === id)?.name;
    env = data.find(({id: dataId}) => dataId === id)?.environment;
  }

  const envQuery = db.query<Environments, any>('SELECT key, value FROM environments WHERE project_id=?');
  const data = envQuery.all(id);

  let envData = `# lockenv ${version} · ${project}&${env} \n`

  if (data.length !== 0) {
    envData+= data.map((env) => `${env.key}=${env.value}`).join('\n');
  }
  await unlink(route);
  const s = spinner()
  s.start('Downloading File...');
  await Bun.write(route, envData);
  s.stop(`You change to ${project} (${env}) correctly!`);
};

export default pull;