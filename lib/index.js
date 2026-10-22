import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { APP, installer, base, config, list } from "./config.js";

const preqOS = () => {
  return os.platform() == "linux";
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

  console.log("Sober is already installed.");
  return true;
};

const preqHandler = async () => {
  if (!(await preqValidator())) process.exit(1);
  mkdirSync(base, { recursive: true });
  if(!existsSync(list)) writeFileSync(list,"[]")
};

preqHandler();
