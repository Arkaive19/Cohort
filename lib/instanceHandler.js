import { spawn } from "node:child_process";
import { APP, base, config, listFile } from "./config.js";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  renameSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import path from "node:path";

const validateInstance = (name) => /^[a-zA-Z]+$/.test(name);
const validateFile = (filePath) => existsSync(filePath);

const mkdir = (name, dir = base) =>
  mkdirSync(path.join(dir, name), { recursive: true });

const cat = (content, file = listFile) => writeFileSync(file, content);

const rm = (name, dir = base) =>
  rmSync(path.join(dir, name), { recursive: true, force: true });

const mv = (oldName, newName, dir = base) =>
  renameSync(path.join(dir, oldName), path.join(dir, newName));

const cp = (dest, src = config) => copyFileSync(src, dest);

const instanceList = () => JSON.parse(readFileSync(listFile, "utf8"));
const instanceLog = (fn = (a) => a) => cat(JSON.stringify(fn(instanceList())));
const listChecker = (inst) => instanceList().includes(inst);

export const add = (instance) => {
  if (!validateInstance(instance))
    throw new Error("Invalid Instance Name (must be letters)");
  if (listChecker(instance)) throw new Error("Instance Already Exists");
  mkdir(instance);
  instanceLog((a) => [...a, instance]);
  return `Added new instance ${instance}`;
};

export const rename = (oldName, newName) => {
  if (!validateInstance(oldName) || !validateInstance(newName))
    throw new Error("Invalid Instance Name (must be letters)");
  if (oldName === newName)
    throw new Error("Old and new names can't be the same");
  if (!listChecker(oldName))
    throw new Error("Old Instance Doesn't Exist, Can't Rename");
  if (listChecker(newName)) throw new Error("New Instance Name Already Exists");
  if (!validateFile(path.join(base, oldName)))
    throw new Error("Instance folder is missing, delete it and add it again");

  mv(oldName, newName);
  instanceLog((a) => a.map((n) => (n === oldName ? newName : n)));
  return `Changed ${oldName} --> ${newName}`;
};

export const remove = (instance) => {
  if (!validateInstance(instance))
    throw new Error("Invalid Instance Name (must be letters)");
  if (!listChecker(instance)) throw new Error("Instance Doesnt Exist");
  rm(instance);
  instanceLog((a) => a.filter((n) => n !== instance));
  return `Removed ${instance}`;
};

export const list = instanceList;

export const run = (instance) => {
  if (!validateInstance(instance))
    throw new Error("Invalid Instance Name (must be letters)");
  if (!listChecker(instance)) throw new Error("Instance Doesnt Exist");
  const home = path.join(base, instance);
  mkdir("", home);

  const child = spawn("flatpak", ["run", APP], {
    env: { ...process.env, HOME: home },
    detached: true,
    stdio: "ignore",
  });

  child.on("error", console.error);
  child.unref();
  return `Running ${instance}`;
};

export const importSettings = (instance) => {
  if (!validateInstance(instance))
    throw new Error("Invalid Instance Name (must be letters)");
  if (!listChecker(instance)) throw new Error("Instance Doesnt Exist");

  const dest = path.join(base, instance, ".var/app", APP, "config/sober");
  mkdir(dest, "/");
  cp(path.join(dest, "config.json"));
  return `Imported Base Settings For ${instance}`;
};
