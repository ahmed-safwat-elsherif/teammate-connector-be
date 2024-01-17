import colors from 'colors';
import ControlFolder from '../models/ControlFolder.js';
import Control from '../models/Control.js';
import {
  createTMControl,
  getTMControl,
  removeTMControl,
  updateTMControl,
} from '../services/teammate/controls.js';
import asyncHolder from './asyncHolder.js';
import Risk from '../models/Risk.js';
import RiskFolder from '../models/RiskFolder.js';
import FolderMap from '../models/FolderMap.js';

const BATCH_COUNT = 5;
/** @param {import('../services/oneSumX/getRiskToControls.js').Control[]} controls */
export default async function handleBulkControls(controls) {
  const controlsCount = controls.length;
  const numOfBatches = Math.ceil(
    (controlsCount / BATCH_COUNT)
  );
  let batches = [];
  /**
   * Problem, current query doesn't provide a clue about the parent folder id! .. so the solution
   * will be: What we have from the risks-to-controls query, is the riskIds, therefore we will
   * extract from this riskids their accocciated parent ids. This will be acheived using the util
   * "getControlFolderByRiskId"
   */
  const controlFolderIdsMap = new Map();
  for (let index = 0; index < numOfBatches; index++) {
    batches = controls.slice(index * BATCH_COUNT, index * BATCH_COUNT + BATCH_COUNT);
    // Handle Control Folder
    console.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await asyncHolder(4000);
    await Promise.all(
      batches.map(async control => {
        if (!controlFolderIdsMap.has(control.id)) {
          const controlFolder = await getControlFolderByRiskId(control.riskId);
          if (controlFolder) controlFolderIdsMap.set(control.id, controlFolder.id);
        }
        const parentId = controlFolderIdsMap.get(control.id);
        if (parentId) {
          handleControl({ ...control, parentId });
        }
      })
    );
  }
}

/** @param {import('../services/oneSumX/getRiskToControls.js').Control} control */
async function handleControl(control) {
  const { id: oneSumXId, title, parentId, riskId:riskOsxId } = control;

  let controlInSystem = await Control.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let controlInTM = null;
  parentInfo = await ControlFolder.findOne({
    where: { id: parentId },
  });
  console.log({ control, parentInfo: parentInfo?.toJSON() });
  if (!controlInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      controlInTM = await createTMControl(title, parentInfo.id).then(res => res.data);
      controlInSystem = await Control.create({
        id: controlInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
        riskOsxId,
      });
    } catch (error) {
      if (controlInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMControl(controlInTM.id);
      }
      console.dir(error);
      throw new Error(
        `Couldn't create a Control ${controlInTM ? `of title (${controlInTM.title})` : ''}`
      );
    }
  } else {
    const controlInSystemObj = controlInSystem.toJSON();
    const { data, error } = await getTMControl(controlInSystemObj.id)
      .then(res => ({ data: res.data }))
      .catch(err => {
        if (err.response.status === 404) {
          return { data: null };
        }
        return { data: null, error: err.message };
      });
    controlInTM = data;
    if (error)
      throw new Error(
        `Couldn't update a Control ${
          controlInSystem ? `of title (${controlInSystem.title}) ID=${controlInSystem.id}` : ''
        }`
      );
    if (!controlInTM) {
      controlInTM = await createTMControl(title, parentInfo.id).then(res => res.data);
    } else {
      try {
        controlInTM = await updateTMControl(controlInSystem.id, title).then(res => res.data);
      } catch (error) {
        throw new Error(
          `Couldn't update a Control ${
            controlInSystem ? `of title (${controlInSystem.title}) ID=${controlInSystem.id}` : ''
          }`
        );
      }
    }
    controlInSystem.title = title;
    if (controlInTM) {
      controlInSystem.id = controlInTM.id;
    }
    await controlInSystem.save();
  }
  console.log(`✔️ Handled Control (osxID:${control.id} => tmID:${controlInSystem?.id}) `);
}

async function getControlFolderByRiskId(riskId) {
  console.log(`Get data by riskid: ${riskId}`);
  const risk = await Risk.findOne({ where: { oneSumXId: riskId } });
  if (!risk) return;
  console.log(risk?.toJSON());
  const folderMap = await FolderMap.findOne({ where: { riskFolderId: risk?.parentId } });
  console.log('folderMap:');
  console.log(folderMap?.toJSON());
  const controlFolder = await ControlFolder.findOne({ where: { id: folderMap?.controlFolderId } });
  console.log('control folder:');
  console.log(controlFolder?.toJSON());
  return controlFolder.toJSON();
}
