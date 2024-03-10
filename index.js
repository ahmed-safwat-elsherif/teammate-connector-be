import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { serverPort } from './src/config/index.js';
import bodyParser from 'body-parser';
import logger from './src/utils/logger.js';
import cronJobRoutes from './src/routes/cronJob.js';
import userRoutes from './src/routes/users.js';
import logsRoutes from './src/routes/logs.js';
import './src/db/index.js';
import swaggerDocs from './src/utils/swagger.js';
import SyncLogsBuilder from './src/utils/SyncLogsBuilder.js';

// Init the Express instance
const app = express();

// Init the Logs Folder
(async () => {
  await SyncLogsBuilder.init();
})();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Swagger docs handler
app.get('/', (_, res) => {
  res.redirect('/docs');
});

// Routes
app.use('/sync', cronJobRoutes);
app.use('/auth', userRoutes);
app.use('/logs', logsRoutes);

// Start
app.listen(serverPort, async () => {
  swaggerDocs(app, serverPort);
  // await open('http://localhost:3001/docs');
  console.log(`Server is running on port:${serverPort}`);
});
