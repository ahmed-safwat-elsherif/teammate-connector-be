import Cabinet from '../models/cabinet.js';
import {
  createTMCabinet,
  getTMCabinet,
  removeTMCabinet,
  updateTMCabinet,
} from '../services/teammate/cabinets.js';
import asyncHolder from './asyncHolder.js';
import SyncLogsBuilder from './SyncLogsBuilder.js';
import syncManager from './syncManager.js';

/** @param {import('../services/oneSumX/getOneSumXData.js').Cabinet[]} cabinets */
export default async function handleBulkCabinets(cabinets) {
  await asyncHolder(4000);
  await Promise.all(cabinets.map(cabinet => handleCabinet(cabinet)));
  syncManager.updateProgress(cabinets.length);
}

/** @param {import('../services/oneSumX/getOneSumXData.js').Cabinet} cabinet */
async function handleCabinet(cabinet) {
  // One Sum-X Cabinet
  const { id: oneSumXId, title } = cabinet;
  // Cabinet in Helper system
  let cabinetInSystem = await Cabinet.findOne({ where: { oneSumXId } });
  let cabinetInTM = null;
  // If Cabinet wasn't created before
  if (!cabinetInSystem) {
    try {
      // Create the cabinet for both Sync System & Teammate databases
      cabinetInTM = await createTMCabinet(title).then(res => res.data);
      cabinetInSystem = await Cabinet.create({
        id: cabinetInTM.id,
        oneSumXId,
        title,
      });
      SyncLogsBuilder.log(`Cabinet (${cabinetInSystem?.id}) created!`);
    } catch (err) {
      if (cabinetInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMCabinet(cabinetInTM.id);
      }
      SyncLogsBuilder.dir(err);
      throw new Error(
        `Couldn't create a Cabinet ${cabinetInTM ? `of title (${cabinetInTM.title})` : ''}`
      );
    }
  } else {
    // .toJSON() just to elemenate noisy other properies from Model type. (You can ignore it for now!)
    const cabinetInSystemObj = cabinetInSystem.toJSON();
    try {
      // Check if this cabinet in TM (source) is still there
      cabinetInTM = await getTMCabinet(cabinetInSystemObj.id)
        .then(res => res.data)
        .catch(err => {
          SyncLogsBuilder.dir(err.message);
          return null;
        });
      if (!cabinetInTM) {
        // Recreate this Cabinet, considering that this cabinet [in TM (source)] is deleted (someone mistakenly remove it)
        cabinetInTM = await createTMCabinet(title).then(res => res.data);
      } else {
        // Cabinet in TM (source) is updated with One sum-x title
        cabinetInTM = await updateTMCabinet(cabinetInSystemObj.id, title).then(res => res.data);
      }
      // Update the helper system with One sum-x title + Teammate new ID
      cabinetInSystem.title = title;
      if (cabinetInTM) {
        cabinetInSystem.id = cabinetInTM.id;
      }
      await cabinetInSystem.save();
      SyncLogsBuilder.log(`Cabinet (${cabinetInSystem.id}) updated!`);
    } catch (error) {
      SyncLogsBuilder.dir(error);
      throw new Error(
        `Couldn't update a Cabinet ${
          cabinetInSystem ? `of title (${cabinetInSystem.title}) ID = ${cabinetInSystemObj.id}` : ''
        }`
      );
    }
  }
}
