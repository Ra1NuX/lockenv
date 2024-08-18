import db from "../../db";
import { Environments } from "../../models/db";
import { NewEnv } from "../../models/envs";
import checkMetadata from "../checkMetadata";

import chalk from 'chalk';
import create from "./create";
import logger from "../logger";
import { Config } from "../../models/config";
import getProjectId from "../getProjectId";
import { isCancel, select } from "@clack/prompts";
import setMetadataToRoute from "../setMetadataToRoute";
import getAllProjects from "../getAllProjects";
import getProjectData from "../getProjectData";
import selectProjectId from "../selectProjectId";

const log = logger;

const regex = /(\w+)=["']?([^"\n\r]*)["']?/g;

const push = async ({route, ...config}: Config) => {

  logger.setConfig({ silent: config.silent, force: config.force })
  logger.intro('Push project')

  let project, environment, id;

  if('id' in config) {
    id = config.id;
  }else {
    id = getProjectId(config.project, config.environment)
  }

  if(!route) return;
  const file = Bun.file(route);
  if(!await file.exists()) {
    logger.error('File does not exist in the path ./.env');
    return;
  };
  const text = await file.text();

  const { isOutdated, project: metaProject, environment: metaEnvironment, version, toolVersion} = checkMetadata(text);

  if(!metaProject && !project) {
    log.message(chalk.gray('A project is required if you dont have metadata in your file'))
  }

  const projectToUse = project??metaProject;
  const environmentToUse = project ? environment : metaEnvironment??environment;
  id = getProjectId(projectToUse, environmentToUse)

  if(!id) {
    
    id = await selectProjectId({title: 'There is no project with this name, select a project', withCreated: true});

    if(isCancel(id) || !id) {
      return;
    }

    const data = getProjectData(id!);

    await setMetadataToRoute({
      environment: data?.environment,
      project: data?.name,
      silent: config?.silent, 
      force: config?.force,
      route,
    })
  }

  
  if(isOutdated) {
    logger.message(`It's seems you have an outdated version in your envfile (${version}), or the tool (${toolVersion})`)
  }

  const envs: {key: string, value: string}[] = []

  for(let match = regex.exec(text); match !== null; match = regex.exec(text)) {
    envs.push({key: match[1], value: match[2]})
  }

  const envQuery = db.query<Environments,any>('SELECT key,value FROM environments WHERE project_id=?');
  const existingsEnvs = envQuery.all(id);

  const lastEnvsMap = new Map<string, string>(existingsEnvs.map(({key, value}) => ([key, value])));
  const newEnvsMap = new Map<string, string>(envs.map(({key, value}) => ([key, value])))

  const deletedEnvs: NewEnv[] = []
  const modifiedEnvs: NewEnv[] = []
  const createdEnvs: NewEnv[] = []
  const equalEnvs: NewEnv[] = []

  const total: string[] = [];

  lastEnvsMap.forEach((value, key) => {
    const env: NewEnv = {key, value}
    const newValue = newEnvsMap.get(key);
    if(!newValue) {
      deletedEnvs.push(env);
    }else if(newValue !== value) {
      modifiedEnvs.push({
        key,
        value: newValue,
      })
    } else {
      equalEnvs.push(env)
    }
    newEnvsMap.delete(key);
  })

  newEnvsMap.forEach((value, key) => {
    createdEnvs.push({key, value})
  })

  equalEnvs.forEach(({key, value}) => {
    total.push(`${key}=${value}`);
  })
  
  const deleteData = deletedEnvs.map(({key, value}) => {
    total.push(chalk.redBright.bold(`- ${key}=${value}`))
    return `"${key}"`;
  })

  const dQuery = db.query(`DELETE FROM environments WHERE project_id=${id} AND key IN (${deleteData.join(', ')})`);
  dQuery.run()

  modifiedEnvs.forEach(({key, value}) => {
    total.push(chalk.yellow.bold(`% ${key}=${value} (Edited)`));
    const mQuery = db.query(`UPDATE environments SET value=? WHERE project_id=? AND key=?`);
    mQuery.run(value, id!, key)
  })

  createdEnvs.forEach(({key, value}) => {
    total.push(chalk.greenBright.bold(`+ ${key}=${value}`));
    const insertQuery = db.query(`INSERT INTO environments (project_id, key, value) VALUES (?,?,?)`);
    insertQuery.run(id!, key, value);
  })

  logger.table(total);
  console.log('\n')
  
}

export default push;