import { cancel, intro, spinner, text, confirm, ConfirmOptions, outro, log } from "@clack/prompts";
import chalk from "chalk";
import { LoggerConfig } from "../models/config";

let config: LoggerConfig = {};
const s = spinner();

const logger = {
    setConfig: (c: LoggerConfig) => config = c,
    intro: (text: string) => {
      if(config.silent) return;
      console.log('\n')
      intro(chalk.bgCyan('  '+text+'  '));
    },
    cancel: (text: string) => {
      if(config.silent) return;
      cancel(text)
    },
    spinner: {
      start: (text: string) => {
        if(config.silent) return;
        s.start(text);
      },
      stop: (text: string) => {
        if(config.silent) return;
        s.stop(text);
      },
      message: (text: string) => {
        if(config.silent) return;
        s.message(text);
      }
    },
    error: (text: string) => {
      if(config.silent) return;
      cancel(text)
    },
    confirm: async (options: ConfirmOptions) => {
      return config.force ?? await confirm(options);
    },
    message: (message: string) => {
      if(config.silent) return;
      log.message(message)
    },
    table: (rows: string[]) => {
      if(config.silent) return;
      outro("values:");
      rows.forEach((env) => {
        console.log(`${env}`);
      })
    },
    outro: (text: string) => {
      if(config.silent) return;
      outro(text);
    }
}


export default logger;