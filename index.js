import express from "express";
import cors from "cors";
import "dotenv/config";
import { PORT } from "./src/config/index.js";
import bodyParser from "body-parser";
import logger from "./src/utils/logger.js";
import cronJobRoutes from "./src/routes/cronJob.js";

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/sync", cronJobRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
