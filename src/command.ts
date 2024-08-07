import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import list from "./utils/commands/list";
import push from "./utils/commands/push";
import create from "./utils/commands/create";
import _delete from "./utils/commands/delete";
import add from "./utils/commands/add";
import pull from "./utils/commands/pull";

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
    "create [project]",
    "Creates new project",
    (yargs) =>
      yargs
    .positional("project", {
        description: "The name of the new proyect",
        type: "string",
      }),
    async (argv) => {
      let project: string|symbol|undefined = argv.project;
      let env: string|symbol = argv.environment;
      await create(project, env);
      process.exit(0);
    }
  )
  .command(
    "list [id]",
    "list all projects",
    (yargs) =>
      yargs.positional("id", {
        description: "project id to list envs",
        type: "number",
      }),
    (argv) => list(argv.id)
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

      add(key!, value!, {
        project: argv.project!,
        environment: argv.environment,
      });
    }
  )
  .command(
    "delete [id]",
    "Is used for delete a project based on a project id, check the project ids using lockenv list",
    (yargs) =>
      yargs.positional("id", {
        description: "The id of the project to delete",
        type: "number",
      }),
    (argv) => {
      _delete(argv.id)
    }
  )
  .command(
    "pull [project]",
    "Is used for download in a file the enviroments",
    (yargs) =>
      yargs.positional("project", {
        description: "Project to download .env",
        type: "string",
      }),
    async (argv) => {
      await pull(argv.project!, argv.environment, argv.route);
      process.exit(0)
    }
  )
  .command(
    'push [project]',
    "Is used for upload a file and get the envs",
    (yargs) =>
      yargs.positional("project", {
        description: "Project to download .env",
        type: "string",
      }),
      async (argv) => {
        await push(argv.project!, argv.environment, argv.route)
        return process.exit(0)
      }
  )

  .parse();
