import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { APP, installer, base, listFile } from "./config.js";

const preqOS = () => {
  return os.platform() === "linux";
};

const preqInstaller = async () => {
  try {
    execFileSync("flatpak", ["--version"], { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
};

const preqApp = async () => {
  try {
    return execFileSync("flatpak", ["list", "--app", "--columns=application"], {
      encoding: "utf-8",
    })
      .trim()
      .split("\n")
      .includes(APP);
  } catch (err) {
    return false;
  }
};

const preqValidator = async () => {
  if (!preqOS()) {
    console.log(`Cohort is designed only for linux :P`);
    return false;
  }

  if (!(await preqInstaller())) {
    console.log(`Install Flatpak first:\n ${installer}`);
    return false;
  }

  if (!(await preqApp())) {
    console.log(`Install Sober with:\n  $ flatpak install flathub ${APP}`);
    return false;
  }

  // console.log("Sober is already installed.");
  return true;
};

const validList = () => {
  try {
    const data = JSON.parse(readFileSync(listFile, "utf8"));
    return Array.isArray(data) && data.every((n) => typeof n === "string");
  } catch {
    return false;
  }
};

export const preqHandler = async () => {
  if (!(await preqValidator()))
    throw new Error("Prerequisites were not fulfilled");
  mkdirSync(base, { recursive: true });
  if (!existsSync(listFile) || !validList()) {
    const found = readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^[a-zA-Z]+$/.test(d.name))
      .map((d) => d.name);
    writeFileSync(listFile, JSON.stringify(found));
  }
};