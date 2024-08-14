import { expect, test } from "bun:test";
import add from "../src/utils/commands/add";
import db from "../src/db";
import create from "../src/utils/commands/create";
import _delete from "../src/utils/commands/delete";
import { Projects } from "../src/models/db";
import list from "../src/utils/commands/list";

let projectId: number;

test('delete if exist', async () => {
  await list()
  const query = db.query<Projects, any>('SELECT project_id as id FROM projects');
  const data = query.all();
  for(let project of data) {
    await _delete(project.id, true)
    const query = db.query<Projects, any>('SELECT project_id as id FROM projects WHERE id=?');
    const data = query.all(project.id);
    expect(data.length).toBe(0);
  }
})

test('create ', async () => {
  const id = await create('project-for-tests', 'beta');
  expect(id).toBeNumber();
  if(id) {
    projectId = id;
  }
})

test('add', async () => {
  const id = add('TEST', 'VALUE', { project: 'project-for-tests', environment: 'beta' });
  expect(id).not.toBeUndefined();

  if(!id) return;

  const query = db.query('SELECT * FROM environments WHERE project_id = ? ');
  const [data] = query.all(id)

  expect(data).toEqual(expect.objectContaining({key: 'TEST', value: 'VALUE', project_id: id, }))
});

test('delete ', async () => {
  await _delete(projectId, true);
  const query = db.query<Projects, any>('SELECT project_id as id FROM projects WHERE id=?');
    const data = query.all(projectId);
    expect(data.length).toBe(0);
})
