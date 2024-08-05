#! /usr/bin/env bun
import "./command.ts";
import { environmentsQuery, projectsTableQuery } from "./db.ts";

projectsTableQuery.run();
environmentsQuery.run()