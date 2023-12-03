import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { getSettings, setSettings } from "../controllers/cronJob.js";

const router = express.Router();

router.get("/settings", authenticate, getSettings);

router.post("/settings", authenticate, setSettings);

export default router;
