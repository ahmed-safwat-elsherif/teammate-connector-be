import fsPromises from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import moment from 'moment';
import { __dirname } from '../../filePath.js';

const getPathOf = (...fileOrFolder) => path.join(__dirname, 'src', ...fileOrFolder);

export default class SyncLogs {
  /** It represents the logs folder name */
  static currLogFile;
  /** It represents the current logs filename */
  static logsFolder = 'syncLogs';
  static logs = '';
  /** It represents any pending error */
  static error;
  constructor() {
    console.log('test');
  }
  static async init() {
    console.log('Initializing Logs folder .. ');
    const logsPath = getPathOf(SyncLogs.logsFolder);
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

  static async log(message) {
    // Check if SyncLogs has a pending error
    if (SyncLogs.error) {
      console.log(SyncLogs.error);
      throw new Error(SyncLogs.error);
    }
    // Check if SyncLogs has initialized a log file
    if (!SyncLogs.currLogFile) {
      const id = crypto.randomUUID();
      SyncLogs.currLogFile = `${moment().format()}_${id}`;
    }
    SyncLogs.logs += `\n${message}`;
    console.log(message);
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
    const filePath = getPathOf(SyncLogs.logsFolder, SyncLogs.currLogFile);
    try {
      await fsPromises.writeFile(filePath, SyncLogs.logs);
      // Reset values
      SyncLogs.currLogFile = null;
      SyncLogs.logs = '';
      SyncLogs.error = null;
    } catch (error) {
      throw new Error("Couldn't create or save the sync process logs");
    }
  }
}
