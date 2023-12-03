import cronJob from "../utils/cronJob.js";

/**
 *
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @returns
 */
export const getSettings = (_, res) => res.json(cronJob.getSettings());

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const setSettings = (req, res) => {
  const body = req.body;
  try {
    cronJob.setConfig(body);
    cronJob.persistConfig();
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
