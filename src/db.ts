import { Database } from "bun:sqlite";

import { fileURLToPath } from 'url';
import { dirname } from 'path';


let db: Database; 

if(process.env.NODE_ENV === 'production') {

  const filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(filename);
  db = new Database(`${__dirname}/db/lockenv.sqlite`);

} else {
  db = new Database(`./db/lockenv.sqlite`)
}

db.exec("PRAGMA journal_mode = WAL;");

export const projectsTableQuery = db.prepare(`
CREATE TABLE IF NOT EXISTS projects (
  project_id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment TEXT NOT NULL,
  name TEXT NOT NULL
);`);

export const environmentsQuery = db.prepare(`
CREATE TABLE IF NOT EXISTS environments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (project_id)
)`);

export default db;