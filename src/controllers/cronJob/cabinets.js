import syncronize from "../../utils/syncronize.js";

/**
 * @param {import('express').Response} res
 * @returns
 */
export const startSync = async (_, res) => {
  try {
    const data = await syncronize();
    res.json({ message: "Done", data });
  } catch (error) {
    res.status(400).json({ message: error?.message });
  }
};
