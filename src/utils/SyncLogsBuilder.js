import fsPromises from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import moment from 'moment';
import { __dirname } from '../../filePath.js';

const getPathOf = (...fileOrFolder) => path.join(__dirname, 'src', ...fileOrFolder);

class SyncLogsBuilder {
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
    return SyncLogsBuilder.#logsFolder;
  }

  static get fileExtension() {
    return SyncLogsBuilder.#ext;
  }

  static async init() {
    console.log('Initializing Logs folder .. ');
    const logsPath = getPathOf(SyncLogsBuilder.#logsFolder);
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
        SyncLogsBuilder.error = error?.message || "Couldn't create the folder";
      }
    }
  }

  static #saveToLogs(...message) {
    // Check if SyncLogsBuilder has a pending error
    if (SyncLogsBuilder.error) {
      console.log(SyncLogsBuilder.error);
      throw new Error(SyncLogsBuilder.error);
    }
    // Check if SyncLogsBuilder has initialized a log file
    if (!SyncLogsBuilder.currLogFile) {
      // const id = crypto.randomUUID();
      SyncLogsBuilder.currLogFile = `${moment().format().replace(/:/g, '_')}`;
    }
    SyncLogsBuilder.logs += `\n${util.format(...message)}`;
  }

  static log(...message) {
    SyncLogsBuilder.#saveToLogs(...message);
    console.log(...message);
  }

  static dir(...message) {
    SyncLogsBuilder.#saveToLogs(...message);
    console.dir(...message);
  }

  static async saveAndFinalize() {
    // Check if SyncLogsBuilder has a pending error
    if (SyncLogsBuilder.error) {
      console.log(SyncLogsBuilder.error);
      throw new Error(SyncLogsBuilder.error);
    }
    // Check if SyncLogsBuilder has initialized a log file
    if (!SyncLogsBuilder.currLogFile) {
      throw new Error('Current filename is not specified');
    }
    const filePath = getPathOf(
      SyncLogsBuilder.#logsFolder,
      `${SyncLogsBuilder.currLogFile}.${SyncLogsBuilder.#ext}`
    );
    try {
      await fsPromises.writeFile(filePath, SyncLogsBuilder.logs, 'utf8');
      // Reset values
      SyncLogsBuilder.currLogFile = null;
      SyncLogsBuilder.logs = '';
      SyncLogsBuilder.error = null;
    } catch (error) {
      console.dir(error);
      throw new Error("Couldn't create or save the sync process logs");
    }
  }
}

export default SyncLogsBuilder;
