import { expect, test } from "bun:test";
import add from "../src/utils/commands/add";
import db, { environmentsQuery, projectsTableQuery } from "../src/db";
import create from "../src/utils/commands/create";
import _delete from "../src/utils/commands/delete";
import pull from "../src/utils/commands/pull";
import getProjectData from "../src/utils/getProjectData";
import getAllProjects from "../src/utils/getAllProjects";
import { unlink } from "node:fs/promises";
import list from "../src/utils/commands/list";
let projectId: number;

projectsTableQuery.run();
environmentsQuery.run();

test("Delete if exist", async () => {
  const projects = getAllProjects();
  for (let project of projects) {
    await _delete({ id: project.id, force: true, silent: true });
    const id = getProjectData(project.id);
    expect(id).toBeUndefined();
  }
});

test("Create new project", async () => {
  const id = await create({
    project: "project-for-tests",
    environment: "beta",
    silent: true,
    force: true,
  });
  expect(id).toBeNumber();
  if (id) {
    projectId = id;
  }
});

test("Add variables to the project", async () => {
  const id = add("TEST", "VALUE", {
    project: "project-for-tests",
    environment: "beta",
  });
  expect(id).not.toBeUndefined();

  if (!id) return;

  const query = db.query("SELECT * FROM environments WHERE project_id = ? ");
  const [data] = query.all(id);

  expect(data).toEqual(
    expect.objectContaining({ key: "TEST", value: "VALUE", project_id: id })
  );
});

test(`Delete with ID`, async () => {
  await _delete({ id: projectId, force: true, silent: true });
  const project = getProjectData(projectId);
  expect(project).toBeUndefined();
});

test(`Delete with ID without exists`, async () => {
  await _delete({ id: projectId, force: true, silent: true });
  const project = getProjectData(projectId);
  expect(project).toBeUndefined();
});

test("Pull with metadata", async () => {
  const file = Bun.file(".env");

  if (await file.exists()) {
    unlink(".env");
    await Bun.write(".env", "TEST=1");
  }
  await pull(
    {
      environment: "beta",
      project: "project-for-tests",
      route: ".env",
      silent: true,
      force: true,
    },
    {
      project: "project-for-tests",
      environment: "prod",
    }
  );
});

test("Pull without projects", async () => {
  await pull(
    {
      environment: "beta",
      project: "project-for-tests",
      route: ".env",
      silent: true,
      force: true,
    },
    {
      project: "project-for-tests",
      environment: "prod",
    }
  );
});

test("List", async () => {
  await list({force: true, id: projectId, silent: true});
});
