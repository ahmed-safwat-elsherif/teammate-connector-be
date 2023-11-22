import express from "express";
import cors from "cors";
import "dotenv/config";
import { PORT } from "./src/config/index.js";
import bodyParser from "body-parser";
import cronJob from "./src/utils/cronJob.js";

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, _, next) => {
  console.log("Request: ", { method: req.method, endpoint: req.url });
  setTimeout(() => {
    next();
  }, 1000);
});

app.get("/", (_, res) => {
  res.json({ message: "Hello" });
});

app.get("/sync/settings", (req, res) => {
  res.json({ me });
});

app.post("/sync/settings", (req, res) => {
  const body = req.body;
  try {
    cronJob.start(() => console.log("Hellooooooo"), body);
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
