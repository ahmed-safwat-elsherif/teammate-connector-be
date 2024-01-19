import getOneSumXData from '../../services/oneSumX/getOneSumXData.js';
import getRiskToControls from '../../services/oneSumX/getRiskToControls.js';

/**
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @returns
 */
export const getOSXData = async (_, res) => {
  try {
    const oneSumData = await  getRiskToControls();
    const data = await getOneSumXData();
    res.json({...data, ...oneSumData})
  } catch (error) {
    res.status(400);
  }
};
