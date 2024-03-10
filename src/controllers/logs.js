import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { __dirname } from '../../filePath.js';
import SyncLogsBuilder from '../utils/SyncLogsBuilder.js';
import fileExists from '../utils/fileExists.js';

const getPathOf = (...fileOrFolder) => path.join(__dirname, 'src', ...fileOrFolder);

const logsPath = getPathOf(SyncLogsBuilder.logsFolderName);

/**
 * Reading the list of log files inside the log folder
 *
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @see {@link SyncLogsBuilder.logsFolderName}
 */
export const getLogFiles = async (_, res) => {
  // Get Log files
  try {
    // Get list of files:
    const files = await fsPromises.readdir(logsPath);
    res.send(files);
  } catch (error) {
    res.status(500).json({ message: "Couldn't process the log files" });
  }
};

/**
 * Reading the file by its name inside the log folder
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @see {@link SyncLogsBuilder.logsFolderName}
 */
export const getFileByName = async (req, res) => {
  // Get Log files
  try {
    const filename = req.params.filename;

    if (!filename) {
      res.status(400).json({ message: 'Filename must be provided as url param' });
      return;
    }

    const filePath = getPathOf(SyncLogsBuilder.logsFolderName, filename);
    const exists = await fileExists(filePath);

    if (!exists) {
      res.status(404).json({ message: `File "${filename}" is not found` });
      return;
    }

    const file = await fsPromises.readFile(filePath, { encoding: 'utf-8' });
    res.send(file);
  } catch (error) {
    res.status(500).json({ message: "Couldn't process the requested file" });
  }
};
