import Cabinet from "../models/Cabinet.js";
import {
  createTMCabinet,
  getTMCabinet,
  removeTMCabinet,
  updateTMCabinet,
} from "../services/teammate/cabinets.js";

/**
 *
 * @param {import("../services/oneSumX/getOneSumXData.js").Cabinet[]} cabinets
 */
export default async function handleBulkCabinets(cabinets) {
  await Promise.all(cabinets.map((cabinet) => handleCabinet(cabinet)));
}

/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Cabinet} cabinet
 */
async function handleCabinet(cabinet) {
  const { id: oneSumXId, title } = cabinet;
  let cabinetInSystem = await Cabinet.findOne({ where: { oneSumXId } });
  let cabinetInTM = null;
  if (!cabinetInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      cabinetInTM = await createTMCabinet(title).then((res) => res.data);
      cabinetInSystem = await Cabinet.create({
        id: cabinetInTM.id,
        oneSumXId,
        title,
      });
      console.log(`Cabinet (${cabinetInSystem?.id}) created!`);
    } catch {
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
    const cabinetInSystemObj = cabinetInSystem.toJSON();
    try {
      cabinetInTM = await getTMCabinet(cabinetInSystemObj.id)
        .then((res) => res.data)
        .catch((err) => {
          console.dir(err.message);
          console.dir(err.config);
          return null;
        });
      if (!cabinetInTM) {
        cabinetInTM = await createTMCabinet(title).then((res) => res.data);
      } else {
        cabinetInTM = await updateTMCabinet(cabinetInSystemObj.id, title).then(
          (res) => res.data
        );
      }
      cabinetInSystem.title = title;
      if (cabinetInTM) {
        cabinetInSystem.id = cabinetInTM.id;
      }
      await cabinetInSystem.save();
      console.log(`Cabinet (${cabinetInSystem.id}) updated!`);
    } catch (error) {
      throw new Error(
        `Couldn't update a Cabinet ${
          cabinetInSystem
            ? `of title (${cabinetInSystem.title}) ID = ${cabinetInSystemObj.id}`
            : ""
        }`
      );
    }
  }
}
