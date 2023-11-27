import express from "express";
import cors from "cors";
import "dotenv/config";
import { serverPort } from "./src/config/index.js";
import bodyParser from "body-parser";
import logger from "./src/utils/logger.js";
import cronJobRoutes from "./src/routes/cronJob.js";
import userRoutes from "./src/routes/users.js";
import "./src/db/index.js";
import "./src/models/user.js";

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/sync", cronJobRoutes);
app.use("/auth", userRoutes);

// Start
app.listen(serverPort, () => {
  console.log(`Server is running on port:${serverPort}`);
});
