import db from "../../db";
import { Environments, Projects } from "../../models/db";
import { NewEnv } from "../../models/envs";
import checkMetadata from "../checkMetadata";

import chalk from 'chalk';
import create from "./create";
const log = console.log;

const regex = /(\w+)=["']?([^"\n\r]*)["']?/g;

const push = async (project: string, environment: string, route: string) => {

  const file = Bun.file(route);
  const text = await file.text();

  const { isFirstTime, isOutdated, project: metaProject, environment: metaEnvironment, version, toolVersion} = checkMetadata(text);

  
  if(isFirstTime) {
    console.info("It's seems you dont have a project linked to this file") // TODO: Hacer que se pueda crear desde aqui. 
  }

  if(!metaProject && !project) {
    console.error('project is required if you dont have metadata in your file')
  }

  const projectToUse = project??metaProject;
  const environmentToUse = project ? environment : metaEnvironment??environment

  const projectQuery = db.query<Partial<Projects>, any>('SELECT project_id as id FROM projects WHERE name=? AND environment=? LIMIT 1');
  let [projectData] = projectQuery.all(projectToUse, environmentToUse);

  if(!projectData) {
    const createConfirm = confirm('There is no project with this name, do you want to create it automatically?');
    if(!createConfirm) return;
    const id = await create(projectToUse, environmentToUse);
    projectData = {
      id,
    }
  }

  const { id: projectId } = projectData;

  
  if(isOutdated) {
    console.info(`It's seems you have an outdated version in your envfile (${version}), or the tool (${toolVersion})`)
  }

  const envs: {key: string, value: string}[] = []

  for(let match = regex.exec(text); match !== null; match = regex.exec(text)) {
    envs.push({key: match[1], value: match[2]})
  }

  const envQuery = db.query<Environments,any>('SELECT key,value FROM environments WHERE project_id=?');
  const existingsEnvs = envQuery.all(projectId);

  const lastEnvsMap = new Map<string, string>(existingsEnvs.map(({key, value}) => ([key, value])));
  const newEnvsMap = new Map<string, string>(envs.map(({key, value}) => ([key, value])))

  const deletedEnvs: NewEnv[] = []
  const modifiedEnvs: NewEnv[] = []
  const createdEnvs: NewEnv[] = []
  const equalEnvs: NewEnv[] = []

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
    log(chalk.bold(`✓ ${key}=${value}`));
  })
  
  const deleteData = deletedEnvs.map(({key, value}) => {
    log(chalk.redBright.bold(`- ${key}=${value}`));
    return `"${key}"`;
  })

  const dQuery = db.query(`DELETE FROM environments WHERE project_id=${projectId} AND key IN (${deleteData.join(', ')})`);
  dQuery.run()

  modifiedEnvs.forEach(({key, value}) => {
    log(chalk.yellow.bold(`% ${key}=${value} (Edited)`));
    const mQuery = db.query(`UPDATE environments SET value=? WHERE project_id=? AND key=?`);
    mQuery.run(value, projectId!, key)
  })

  createdEnvs.forEach(({key, value}) => {
    log(chalk.greenBright.bold(`+ ${key}=${value}`));
    const insertQuery = db.query(`INSERT INTO environments (project_id, key, value) VALUES (?,?,?)`);
    insertQuery.run(projectId!, key, value);
  })
}

export default push;