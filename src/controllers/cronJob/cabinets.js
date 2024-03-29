import removeTables from "../../utils/removeTables.js";
import syncronize from "../../utils/syncronize.js";

/**
 * @param {import('express').Response} res
 * @returns
 */
export const startSync = async (_, res) => {
  try {
    const { message, syncStatus } = await syncronize();
    res.json({ message, syncStatus });
  } catch (error) {
    res.status(400).json({ message: error?.message, syncStatus });
  }
};

/**
 * @param {import('express').Response} res
 * @returns
 */
export const deleteAllTables = async (_, res) => {
  try {
    await removeTables();
    res.json({ message: "All tables are removed successfully!" });
  } catch (error) {
    res.status(400).json({ message: error?.message });
  }
};
