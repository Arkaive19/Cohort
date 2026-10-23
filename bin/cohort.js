#!/usr/bin/env node
import { createRequire } from "module";
import { preqHandler } from "../lib/index.js";
import {
  run,
  add,
  rename,
  remove,
  list,
  importSettings,
} from "../lib/instanceHandler.js";
const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const usage = `Cohort, a Multi Instance Launcher CLI tool for Sober ${version}

Usage:
  cohort <option> [arguments]

Options:
  add <name>             Create an instance
  list                   List instances
  rename <old> <new>     Rename an instance
  delete <name>          Delete an instance
  run <name>             Launch Sober
  import <name>          Import default Sober settings
  --help                 Show this help | (--h)
  --version              Show version   | (--v)
`;

const main = async () => {
  const [option, ...args] = process.argv.slice(2);
  if (!option || option == "--help" || option == "--h") {
    console.log(usage);
    return;
  }

  if (option == "--version" || option == "--v") {
    console.log(version);
    return;
  }

  const commands = {
    add: { count: 1, run: ([name]) => add(name) },
    list: {
      count: 0,
      run: () => {
        const instances = list();
        console.log(
          instances.length ? instances.join("\n") : "No instances found.",
        );
      },
    },
    rename: {
      count: 2,
      run: ([oldName, newName]) => rename(oldName, newName),
    },
    delete: { count: 1, run: ([name]) => remove(name) },
    run: { count: 1, run: ([name]) => run(name) },
    import: {
      count: 1,
      run: ([name]) => importSettings(name),
    },
  };

  const command = commands[option];

  if (!command) {
    console.error(`Unknown option: ${option}\n\n${usage}`);
    process.exitCode = 1;
    return;
  }

  if (args.length !== command.count) {
    console.error(`Invalid arguments for "${option}".\n\n${usage}`);
    process.exitCode = 1;
    return;
  }

  try {
    await preqHandler();
    console.log(await command.run(args));
  } catch (error) {
    console.error(`Cohort: ${error.message}`);
    process.exitCode = 1;
  }
};
main();
