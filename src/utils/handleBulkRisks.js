import colors from 'colors';
import Risk from '../models/risk.js';
import { createTMRisk, getTMRisk, removeTMRisk, updateTMRisk } from '../services/teammate/risks.js';
import RiskFolder from '../models/RiskFolder.js';
import asyncHolder from './asyncHolder.js';
import syncManager from './syncManager.js';
import SyncLogs from './syncLogs.js';

const BATCH_COUNT = 5;
/** @param {import('../services/oneSumX/getOneSumXData.js').Risk[]} risks */
export default async function handleBulkRisks(risks) {
  const risksCount = risks.length;
  const numOfBatches = Math.ceil(risksCount / BATCH_COUNT);
  let batches = [];
  for (let index = 0; index < numOfBatches; index++) {
    batches = risks.slice(index * BATCH_COUNT, index * BATCH_COUNT + BATCH_COUNT);

    SyncLogs.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await asyncHolder(4000);
    await Promise.all(batches.map(risk => handleRisk(risk)));
    syncManager.updateProgress(batches.length);
  }
}

/** @param {import('../services/oneSumX/getOneSumXData.js').Risk} risk */
async function handleRisk(risk) {
  const { id: oneSumXId, title, parentId: oneSumXParentId } = risk;
  SyncLogs.log(`⏳ Handling Risk (osxID:${oneSumXId})`);

  let riskInSystem = await Risk.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let riskInTM = null;
  parentInfo = await RiskFolder.findOne({
    where: { oneSumXId: oneSumXParentId },
  });
  if (!riskInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      riskInTM = await createTMRisk(title, parentInfo.id).then(res => res.data);
      riskInSystem = await Risk.create({
        id: riskInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
      });
    } catch (error) {
      if (riskInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMRisk(riskInTM.id);
      }
      SyncLogs.dir(error);
      throw new Error(`Couldn't create a Risk ${riskInTM ? `of title (${riskInTM.title})` : ''}`);
    }
  } else {
    const riskInSystemObj = riskInSystem.toJSON();
    const { data, error } = await getTMRisk(riskInSystemObj.id)
      .then(res => ({ data: res.data }))
      .catch(error => ({ data: null, error }));

    riskInTM = data;

    if (error?.response?.status !== 404) {
      SyncLogs.dir(error);
      throw new Error(
        `Couldn't update a Risk ${
          riskInSystem ? `of title (${riskInSystem.title}) ID=${riskInSystem.id}` : ''
        }`
      );
    }

    if (!riskInTM) {
      try {
        riskInTM = await updateTMRisk(riskInSystem.id, title).then(res => res.data);
        riskInSystem.id = riskInTM.id;
        riskInSystem.title = title;
        await riskInSystem.save();
      } catch (error) {
        SyncLogs.dir(error);
        throw new Error(
          `Couldn't update a Risk ${
            riskInSystem ? `of title (${riskInSystem.title}) ID=${riskInSystem.id}` : ''
          }`
        );
      }
    } else {
      riskInTM = await createTMRisk(title, parentInfo.id).then(res => res.data);
    }
  }
  SyncLogs.log(`✔️ Handled Risk (osxID:${risk.id} => tmID:${riskInSystem?.id}) `);
}
