import fs from "fs/promises";
import path from "path";
import { __dirname } from "../../filePath.js";

const SETTINGS_PATH = path.join(__dirname, "/src/data/settings.json");

export const readSettings = () =>
  fs
    .readFile(SETTINGS_PATH, { encoding: "utf-8" })
    .then((settings) => JSON.parse(settings));

export const writeSettings = async (settings) => {
  try {
    return fs.writeFile(SETTINGS_PATH, JSON.stringify(settings));
  } catch (error) {
    return new Error("Couldn't save the new settings");
  }
};
