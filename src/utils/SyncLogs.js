import fsPromises from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import moment from 'moment';
import { getURLDirname } from '../../filePath.js';

const getPathOf = (...fileOrFolder) => path.join('.', 'src', ...fileOrFolder);

export default class SyncLogs {
  /** It represents the logs folder name */
  static currLogFile;
  /** It represents the current logs filename */
  static #logsFolder = 'syncLogs';
  static #ext = 'log';
  static logs = '';
  /** It represents any pending error */
  static error;
  constructor() {
    console.log('test');
  }

  static get logsFolderName() {
    return SyncLogs.#logsFolder;
  }

  static get fileExtension() {
    return SyncLogs.#ext;
  }

  static async init() {
    console.log('Initializing Logs folder .. ');
    const logsPath = getPathOf(SyncLogs.#logsFolder);
    try {
      // Check if folder exists:
      const dir = await fsPromises.opendir(logsPath);
      dir.closeSync();
    } catch (error) {
      try {
        await fsPromises.mkdir(logsPath);
        console.log('✔️ Logs Folder created successfully');
      } catch (error) {
        console.log("❌ Couldn't create the folder");
        SyncLogs.error = error?.message || "Couldn't create the folder";
      }
    }
  }

  static #saveToLogs(...message) {
    // Check if SyncLogs has a pending error
    if (SyncLogs.error) {
      console.log(SyncLogs.error);
      throw new Error(SyncLogs.error);
    }
    // Check if SyncLogs has initialized a log file
    if (!SyncLogs.currLogFile) {
      // const id = crypto.randomUUID();
      SyncLogs.currLogFile = `${moment().format().replace(/:/g, '_')}`;
    }
    SyncLogs.logs += `\n${util.format(...message)}`;
  }

  static log(...message) {
    SyncLogs.#saveToLogs(...message);
    console.log(...message);
  }

  static dir(...message) {
    SyncLogs.#saveToLogs(...message);
    console.dir(...message);
  }

  static async saveAndFinalize() {
    // Check if SyncLogs has a pending error
    if (SyncLogs.error) {
      console.log(SyncLogs.error);
      throw new Error(SyncLogs.error);
    }
    // Check if SyncLogs has initialized a log file
    if (!SyncLogs.currLogFile) {
      throw new Error('Current filename is not specified');
    }
    const filePath = getPathOf(SyncLogs.#logsFolder, `${SyncLogs.currLogFile}.${SyncLogs.#ext}`);
    try {
      await fsPromises.writeFile(filePath, SyncLogs.logs, 'utf8');
      // Reset values
      SyncLogs.currLogFile = null;
      SyncLogs.logs = '';
      SyncLogs.error = null;
    } catch (error) {
      console.dir(error);
      throw new Error("Couldn't create or save the sync process logs");
    }
  }
}
