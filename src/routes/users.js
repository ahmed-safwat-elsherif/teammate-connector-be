import express from "express";
const router = express.Router();

router.post("/register", (req, res) => {
  const body = req.body;

  try {
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
