#! /usr/bin/env bun
import { environmentsQuery, projectsTableQuery } from "./db.ts";

projectsTableQuery.run();
environmentsQuery.run()

import "./command.ts";