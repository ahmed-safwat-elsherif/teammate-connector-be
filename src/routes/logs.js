import express from 'express';
import fs from 'fs';
import path from 'path';
import authenticate from '../middlewares/authenticate.js';
import isAdmin from '../middlewares/isAdmin.js';
import { getFileByName, getLogFiles } from '../controllers/logs.js';

const router = express.Router();

/** // * // * @param {import('express').Response} res // */
// async function getLogFiles(_, res) {
//     fs.readdir('logs', (err, files) => {
//         if (err) {
//             res.status(503).json({ message: `Can not Read Logs: ${err}` });
//             return;
//         }
//         res.status(200).json({ data: { files } });
//     });
// }

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  * @returns
//  */
// async function readLogFile(req, res) {
//   const { idx } = req.params;
//   let fileIndex = Number(idx);

//   fs.readdir('logs', (err, files) => {
//     if (err) {
//       res.status(503).json({ message: `Can not Read Logs: ${err}` });
//       return;
//     }

//     if (fileIndex >= files.length) {
//       res.status(400).json({ message: 'Bad File Index' });
//       return;
//     }

//     const fileName = files[fileIndex];
//     const filePath = path.join('logs', fileName);
//     fs.readFile(filePath, 'utf8', (err, content) => {
//       if (err) {
//         res.status(503).json({ message: `Can not Read File: ${filePath}` });
//         return;
//       }
//       res.status(200).json({ data: { logs: content } });
//     });
//   });
// }

// router.get('/files', getLogFiles);
// router.get('/files/:idx', readLogFile);
router.get('/files', getLogFiles);
router.get('/files/:filename', getFileByName);

export default router;
