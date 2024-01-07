import getOneSumXData from '../../services/oneSumX/getOneSumXData.js';

/**
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @returns
 */
export const getOSXData = async (_, res) => {
  try {
    const data = await getOneSumXData();
    res.json(data);
  } catch (error) {
    res.status(400);
  }
};
