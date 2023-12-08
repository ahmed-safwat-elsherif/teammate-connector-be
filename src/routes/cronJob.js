import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { getSettings, setSettings } from "../controllers/cronJob.js";
import { startSync } from "../controllers/cabinets.js";

const router = express.Router();

router.get("/settings", authenticate, getSettings);

router.post("/settings", authenticate, setSettings);

router.get("/run", startSync);

export default router;
