import express from "express";
import cronJob from "../utils/cronJob.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/settings", authenticate, (_, res) => {
  res.json(cronJob.getSettings());
});

router.post("/settings", (req, res) => {
  const body = req.body;
  try {
    cronJob.start(() => console.log("Hellooooooo"), body);
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
