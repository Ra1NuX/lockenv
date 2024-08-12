import { expect, test } from "bun:test";
import add from "../src/utils/commands/add";

test("Create enviroment variable", async () => {
  add('TEST', 'VALUE', {project: 'project-for-tests', environment: 'beta'});
});