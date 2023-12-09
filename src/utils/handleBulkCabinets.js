import Cabinet from "../models/cabinet.js";
import {
  createTMCabinet,
  getTMCabinet,
  removeTMCabinet,
  updateTMCabinet,
} from "../services/teammate/cabinets.js";

/**
 *
 * @param {[string, import("../services/oneSumX/getOneSumXData.js").Cabinet][]} cabinets
 */
export default async function handleBulkCabinets(cabinets) {
  await Promise.all(
    cabinets.map(async ([, cabinet]) => {
      const { id: oneSumXId, title } = cabinet;
      let cabinetInSystem = await Cabinet.findOne({ where: { oneSumXId } });
      let cabinetInTM = null;
      if (!cabinetInSystem) {
        try {
          // Add the cabinet for both Sync System & Teammate databases
          cabinetInTM = await createTMCabinet(title).then((res) => res.data);
          await Cabinet.create({ id: cabinetInTM.id, oneSumXId, title });
        } catch (error) {
          if (cabinetInTM) {
            // Revert back if cabinet is already created in Teammate
            await removeTMCabinet(cabinetInTM.id);
          }
          throw new Error(
            `Couldn't create a Cabinet ${
              cabinetInTM ? `of title (${cabinetInTM.title})` : ""
            }`
          );
        }
      } else {
        try {
          cabinetInTM = await getTMCabinet(cabinetInSystem.id)
            .then((res) => res.data)
            .catch((err) => {
              console.dir(err);
              return null;
            });
          if (!cabinetInTM) {
            cabinetInTM = await createTMCabinet(title).then((res) => res.data);
          } else {
            cabinetInTM = await updateTMCabinet(cabinetInSystem.id, title).then(
              (res) => res.data
            );
          }
          cabinetInSystem.title = title;
          if (cabinetInTM) {
            cabinetInSystem.id = cabinetInTM.id;
          }
          await cabinetInSystem.save();
        } catch (error) {
          throw new Error(
            `Couldn't update a Cabinet ${
              cabinetInSystem ? `of title (${cabinetInSystem.title})` : ""
            }`
          );
        }
      }
    })
  );
}
