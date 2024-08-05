import db from "../db";
import { Environments, Projects } from "../models/db";

export const listProjects = (id?: number) => {
  try {
    if (id) {
      const enviromentsQuery = db.prepare<Environments, any>(
        `SELECT * FROM environments WHERE project_id = ?1`
      );
      const environments = enviromentsQuery.all(id);

      const rows = environments.map(({ key, value }) => `${key}=${value}`);
      console.table(rows);
      return;
    }

    const projectQuery = db.prepare<Projects, any>(
      `SELECT project_id as id, name, environment FROM projects`
    );
    const rows = projectQuery.all();

    if (!rows.length) {
      console.info(
        "There is no project yet. To create a new project use: lockenv create project <name>"
      );
      return;
    }

    const enviromentsQuery = db.prepare<Environments, any>(
      `SELECT * FROM environments`
    );
    const environments = enviromentsQuery.all();

    const envsByProject = new Map<number, { key: string; value: string }[]>();

    for (let i = 0; i < environments.length; i++) {
      const env = environments[i];
      const projectEnvs = envsByProject.get(env.project_id);
      if (!projectEnvs) {
        envsByProject.set(env.project_id, [{ key: env.key, value: env.value }]);
      } else {
        projectEnvs.push({
          key: env.key,
          value: env.value,
        });
      }
    }

    const rowsWithEnvs = rows.map(({ environment, id, name }) => {
      const environmentForThisProject = envsByProject.get(id);
      if (environmentForThisProject) {
        let envs = environmentForThisProject
          .map(({ key, value }, index) => index < 3 && `${key}=${value}`)
          .filter(Boolean)
          .join(`, `);

        if (environmentForThisProject.length > 3) {
          envs += `... (${environmentForThisProject.length - 3} more)`;
        }

        return {
          id,
          name,
          environment,
          envs,
        };
      } else {
        return {
          id,
          name,
          environment,
        };
      }
    });

    console.table(rowsWithEnvs);
  } catch (error) {
    console.error("Error querying projects:", error);
  }
};
