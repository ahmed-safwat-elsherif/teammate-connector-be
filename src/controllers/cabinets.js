import syncronize from "../utils/syncronize.js";

/**
 * @param {import('express').Response} res
 * @returns
 */
export const startSync = async (_, res) => {
  try {
    await syncronize();
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: "Error occured in syncronization!" });
  }
};
