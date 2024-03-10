import colors from 'colors';
import Cabinet from '../models/cabinet.js';
import RiskFolder from '../models/RiskFolder.js';
import FolderMap from '../models/FolderMap.js';
import {
  FOLDER_TYPE_RISK,
  createTMFolder,
  getTMFolder,
  removeTMFolder,
  updateTMFolder,
} from '../services/teammate/folders.js';
import ControlFolder from '../models/ControlFolder.js';
import asyncHolder from './asyncHolder.js';
import syncManager from './syncManager.js';
import SyncLogsBuilder from './SyncLogsBuilder.js';

const BATCH_COUNT = 5;
/**
 * @param {import('../services/oneSumX/getOneSumXData.js').Folder[]} folders
 * @param {boolean} parentIsFolder
 * @param {'RISK' | 'CONTROL'} folderType
 */
export default async function handleBulkFolders(folders, parentIsFolder, folderType) {
  const parentIds = [...new Set(folders.map(folder => folder.parentId))];
  for (let index = 0; index < parentIds.length; index++) {
    const currentParentId = parentIds[index];
    const subFolders = folders.filter(folder => folder.parentId === currentParentId);
    SyncLogsBuilder.log(
      colors.bgBlue.white(
        `\n --- Subfolders of ${
          parentIsFolder ? 'Parent Folder Id=' : 'Cabinet Id='
        } (${currentParentId})\n`
      )
    );
    await handleBatchsOfFolders(subFolders, parentIsFolder, folderType);
  }
}

/**
 * @param {import('../services/oneSumX/getOneSumXData.js').Folder[]} folders
 * @param {boolean} parentIsFolder
 * @param {'RISK' | 'CONTROL'} folderType
 */
async function handleBatchsOfFolders(folders, parentIsFolder, folderType) {
  /**
   * Define "Batches": "Batch" is 5 requests (according to the global variable 'BATCH_COUNT'), each
   * batch of folders will be executed according to a sleep interval of 4000 ms (4 seconds)
   */
  const foldersCount = folders.length;
  const numOfBatches = Math.ceil(foldersCount / BATCH_COUNT);
  let batchOfFolders = [];
  for (let index = 0; index < numOfBatches; index++) {
    batchOfFolders = folders.slice(index * BATCH_COUNT, index * BATCH_COUNT + BATCH_COUNT);

    SyncLogsBuilder.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await asyncHolder(4000);
    await Promise.all(
      batchOfFolders.map(folder => handleFolder(folder, parentIsFolder, folderType))
    );
    syncManager.updateProgress(batchOfFolders.length);
  }
}

/**
 * @param {import('../services/oneSumX/getOneSumXData.js').Folder} folder
 * @param {boolean} parentIsFolder
 * @param {'RISK' | 'CONTROL'} folderType
 */
async function handleFolder(folder, parentIsFolder, folderType) {
  const { id: oneSumXId, title, parentId: oneSumXParentId } = folder;
  SyncLogsBuilder.log(`⏳ Handling Folder (osxID:${oneSumXId})`);
  // Define selected models (Risk or Control)
  const isRiskFolder = folderType === FOLDER_TYPE_RISK;
  const Folder = isRiskFolder ? RiskFolder : ControlFolder;
  const ParentModel = parentIsFolder ? Folder : Cabinet;

  let folderInSystem = await Folder.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let folderInTM = null;
  parentInfo = await ParentModel.findOne({
    where: { oneSumXId: oneSumXParentId },
  });

  if (!folderInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      folderInTM = await createTMFolder({
        title,
        parentId: parentInfo.id,
        parentIsFolder,
        folderType,
      }).then(res => res.data);

      folderInSystem = await Folder.create({
        id: folderInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
      });
    } catch (error) {
      if (folderInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMFolder(folderInTM.id, folderType);
      }
      SyncLogsBuilder.dir(error);
      throw new Error(
        `Couldn't create a Folder ${
          folderInTM ? `of title (${folderInTM.title}) LEVEL ${folder.level}` : ''
        }`
      );
    }
  } else {
    const folderInSystemObj = folderInSystem.toJSON();
    const { data, error } = await getTMFolder(folderInSystemObj.id, folderType)
      .then(res => ({ data: res.data }))
      .catch(err => {
        if (err.response.status === 404) {
          return { data: null };
        }
        return { data: null, error: err.message };
      });
    folderInTM = data;
    if (error) {
      SyncLogsBuilder.dir(error);
      throw new Error(
        `Couldn't update a Folder ${
          folderInSystem
            ? `of title (${folderInSystem.title}) ID=${folderInSystem.id} - LEVEL ${folder.level}`
            : ''
        }`
      );
    }
    if (!folderInTM) {
      folderInTM = await createTMFolder({
        title,
        parentId: parentInfo.id,
        parentIsFolder,
        folderType,
      }).then(res => res.data);
    } else {
      try {
        folderInTM = await updateTMFolder(folderInSystem.id, title, folderType).then(
          res => res.data
        );
      } catch (error) {
        SyncLogsBuilder.dir(error);
        throw new Error(
          `Couldn't update a Folder ${
            folderInSystem
              ? `of title (${folderInSystem.title}) ID=${folderInSystem.id} - LEVEL ${folder.level}`
              : ''
          }`
        );
      }
    }
    folderInSystem.title = title;
    if (folderInTM) {
      folderInSystem.id = folderInTM.id;
    }
    await folderInSystem.save();
  }
  // Manage folder mapping
  const folderMap = await FolderMap.findOne({ where: { oneSumXId } });
  const folderAttr = isRiskFolder ? 'riskFolderId' : 'controlFolderId';

  if (folderMap) {
    folderMap[folderAttr] = folderInSystem.toJSON().id;
    await folderMap.save();
  } else {
    await FolderMap.create({
      oneSumXId,
      [folderAttr]: folderInSystem.toJSON().id,
    });
  }
  SyncLogsBuilder.log(
    `✔️ Handled Folder (osxID:${folder.id} => tmID:${folderInSystem?.id}) of LEVEL ${folder.level}`
  );
}
