import Cabinet from "../models/cabinet.js";
import getOneSumXData from "../services/oneSumX/getOneSumXData.js";
import {
  createTMCabinet,
  updateTMCabinet,
} from "../services/teammate/cabinets.js";

/**
 * @param {import('express').Response} res
 * @returns
 */
export const startSync = async (_, res) => {
  try {
    const oneSumData = await getOneSumXData();
    await Promise.all(
      Object.entries(oneSumData).map(async ([, cabinet]) => {
        const { cabinetId: oneSumXId, cabinetName } = cabinet;
        const savedCabinet = await Cabinet.findOne({ where: { oneSumXId } });
        if (!savedCabinet) {
          try {
            const { id } = await createTMCabinet(cabinetName).then(
              (res) => res.data
            );
            await Cabinet.create({ id, oneSumXId, title: cabinetName });
          } catch (error) {
            throw new Error(
              `Couldn't create cabinet ${cabinetName}' of id '${oneSumXId}'`
            );
          }
        } else {
          try {
            await updateTMCabinet(savedCabinet.id, cabinetName);
            savedCabinet.title = cabinetName;
            await savedCabinet.save();
          } catch (error) {
            throw new Error(
              `Couldn't update cabinet '${cabinetName}' of Teammate Id='${savedCabinet.id}'`
            );
          }
        }
      })
    );
    res.json({ message: "Done" });
  } catch (error) {
    res.status(400).json({ message: error?.message });
  }
};
