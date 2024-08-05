import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { listProjects } from "./utils/listProjects";
import createProject from "./utils/createProject";
import deleteProject from "./utils/deleteProject";
import addEnvironment from "./utils/addEnvironment";
import downloadFile from "./utils/downloadFile";
import addEnvsFromFile from "./utils/addEnvsFromFile";

yargs(hideBin(process.argv))
  .option("environment", {
    alias: "env",
    type: "string",
    description: 'use this to set an enviroment',
    default: "beta",
  })
  .option("route", {
    alias: "r",
    type: "string",
    description: 'use this to set route to output or input',
    default: "./.env",
  })
  .command(
    "create <project>",
    "Creates new project",
    (yargs) =>
      yargs
    .positional("project", {
        description: "The name of the new proyect",
        type: "string",
      }),
    (argv) => createProject(argv.project!, argv.environment)
  )
  .command(
    "list [id]",
    "list all projects",
    (yargs) =>
      yargs.positional("id", {
        description: "project id to list envs",
        type: "number",
      }),
    (argv) => listProjects(argv.id)
  )
  .command(
    "add <project> <key_value>",
    "Add a enviroment variable to a project",
    (yargs) =>
      yargs
        .positional("project", {
          description: "Project to add the variable",
          type: "string",
        })
        .positional("key_value", {
          description:
            "key and value separated by = of the enviroment variable",
          type: "string",
        }),
    (argv) => {
      const [key, value] = argv.key_value?.split("=")!;

      if (!key || !value) {
        console.error(
          'Incorrect format dont forget separate key/value with "=" ex: foo=bar'
        );
        return;
      }

      addEnvironment(key!, value!, {
        project: argv.project!,
        environment: argv.environment,
      });
    }
  )
  .command(
    "delete <id>",
    "Is used for delete a project based on a project id, check the project ids using lockenv list",
    (yargs) =>
      yargs.positional("id", {
        description: "The id of the project to delete",
        type: "number",
      }),
    (argv) => deleteProject(argv.id!)
  )
  .command(
    "pull <project>",
    "Is used for download in a file the enviroments",
    (yargs) =>
      yargs.positional("project", {
        description: "Project to download .env",
        type: "string",
      }),
    (argv) => downloadFile(argv.project!, argv.environment, argv.route)
  )
  .command(
    'push [project]',
    "Is used for upload a file and get the envs",
    (yargs) =>
      yargs.positional("project", {
        description: "Project to download .env",
        type: "string",
      }),
      (argv) => {
        addEnvsFromFile(argv.project!, argv.environment, argv.route)
      }
  )

  .parse();
