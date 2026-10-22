
import { spawn } from "node:child_process";
import { APP, base, config, list as listFile } from "./config.js";
import {
  mkdirSync, writeFileSync, readFileSync, rmSync,
  renameSync, copyFileSync
} from "node:fs";
import path from "node:path";

const mkdir = (name, dir = base) =>
  mkdirSync(path.join(dir, name), { recursive: true });

const cat = (content, file = listFile) =>
  writeFileSync(file, content);

const rm = (name, dir = base) =>
  rmSync(path.join(dir, name), { recursive: true });

const mv = (oldName, newName, dir = base) =>
  renameSync(path.join(dir, oldName), path.join(dir, newName));

const cp = (dest, src = config) => copyFileSync(src, dest);

const instanceList = () => JSON.parse(readFileSync(listFile, "utf8"));
const instanceLog = (fn = a => a) =>
  cat(JSON.stringify(fn(instanceList())));

export const add = instance => {
  mkdir(instance);
  instanceLog(a => [...a, instance]);
};

export const rename = (oldName, newName) => {
  mv(oldName, newName);
  instanceLog(a => a.map(n => n === oldName ? newName : n));
};

export const remove = instance => {
  rm(instance);
  instanceLog(a => a.filter(n => n !== instance));
};

export const list = instanceList;

export const run = instance => {
  const home = path.join(base, instance);
  mkdir("", home);

  const child = spawn("flatpak", ["run", APP], {
    env: { ...process.env, HOME: home },
    detached: true,
    stdio: "ignore"
  });

  child.on("error", console.error);
  child.unref();
};

export const importSettings = instance => {
  const dest = path.join(base, instance, ".var/app", APP, "config/sober");
  mkdir(dest, "/");
  cp(path.join(dest, "config.json"));
};
