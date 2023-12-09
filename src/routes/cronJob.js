import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { getSettings, setSettings } from "../controllers/cronJob/cronJob.js";
import { startSync } from "../controllers/cronJob/cabinets.js";
import { getTMCabinet } from "../services/teammate/cabinets.js";

const router = express.Router();

router.get("/settings", authenticate, getSettings);

router.post("/settings", authenticate, setSettings);

router.get("/run", startSync);

router.get("/cabinets/:id", async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const cabinet = await getTMCabinet(id).then((res) => res.data);
    res.json({ message: "Hello", cabinet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
