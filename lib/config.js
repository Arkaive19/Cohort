import os from "node:os";
import path from "node:path";

export const APP = "org.vinegarhq.Sober";
export const installer = "https://flathub.org/en/setup";
export const base = path.join(os.homedir(), "Cohort", "Instances");
export const list = path.join(base, "Instances.list");
export const config = path.join(
  os.homedir(),
  ".var/app",
  APP,
  "config/sober/config.json",
);
