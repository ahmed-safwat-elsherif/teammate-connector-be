import colors from "colors";
import Cabinet from "../models/cabinet.js";
import Folder from "../models/folder.js";
import {
  FOLDER_TYPE_RISK,
  createTMFolder,
  getTMFolder,
  removeTMFolder,
  updateTMFolder,
} from "../services/teammate/folders.js";

const MAX_FOLDERS_COUNT = 1000;
const BATCH_COUNT = 5;
/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Folder[]} folders
 * @param {boolean} parentIsFolder
 */
export default async function handleBulkFolders(folders, parentIsFolder) {
  const parentIds = [...new Set(folders.map((folder) => folder.parentId))];
  for (let index = 0; index < parentIds.length; index++) {
    const currentParentId = parentIds[index];
    const subFolders = folders.filter(
      (folder) => folder.parentId === currentParentId
    );
    console.log(
      colors.bgBlue.white(
        `\n --- Subfolders of ${
          parentIsFolder ? "Parent Folder Id=" : "Cabinet Id="
        } (${currentParentId})\n`
      )
    );
    await handleBatchsOfFolders(subFolders, parentIsFolder);
  }
}

/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Folder[]} folders
 * @param {boolean} parentIsFolder
 */
async function handleBatchsOfFolders(folders, parentIsFolder) {
  const foldersCount = folders.length;
  const numOfBatches = Math.ceil(
    (foldersCount < MAX_FOLDERS_COUNT ? foldersCount : MAX_FOLDERS_COUNT) /
      BATCH_COUNT
  );
  let batches = [];
  for (let index = 0; index < numOfBatches; index++) {
    batches = folders.slice(
      index * BATCH_COUNT,
      index * BATCH_COUNT + BATCH_COUNT
    );

    console.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await Promise.all(
      batches.map((folder) => handleFolder(folder, parentIsFolder))
    );
  }
}

/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Folder} folder
 * @param {boolean} parentIsFolder
 */
async function handleFolder(folder, parentIsFolder) {
  const { id: oneSumXId, title, parentId: oneSumXParentId } = folder;

  let folderInSystem = await Folder.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let folderInTM = null;
  const ParentModel = parentIsFolder ? Folder : Cabinet;
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
        folderType: FOLDER_TYPE_RISK,
      }).then((res) => res.data);

      folderInSystem = await Folder.create({
        id: folderInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
      });
    } catch (error) {
      if (folderInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMFolder(folderInTM.id, FOLDER_TYPE_RISK);
      }
      throw new Error(
        `Couldn't create a Folder ${
          folderInTM
            ? `of title (${folderInTM.title}) LEVEL ${folder.level}`
            : ""
        }`
      );
    }
  } else {
    const folderInSystemObj = folderInSystem.toJSON();
    const { data, error } = await getTMFolder(
      folderInSystemObj.id,
      FOLDER_TYPE_RISK
    )
      .then((res) => ({ data: res.data }))
      .catch((err) => {
        if (err.response.status === 404) {
          return { data: null };
        }
        return { data: null, error: err.message };
      });
    folderInTM = data;
    if (error)
      throw new Error(
        `Couldn't update a Folder ${
          folderInSystem
            ? `of title (${folderInSystem.title}) ID=${folderInSystem.id} - LEVEL ${folder.level}`
            : ""
        }`
      );
    if (!folderInTM) {
      folderInTM = await createTMFolder({
        title,
        parentId: parentInfo.id,
        parentIsFolder,
        folderType: FOLDER_TYPE_RISK,
      }).then((res) => res.data);
    } else {
      try {
        folderInTM = await updateTMFolder(
          folderInSystem.id,
          title,
          FOLDER_TYPE_RISK
        ).then((res) => res.data);
      } catch (error) {
        throw new Error(
          `Couldn't update a Folder ${
            folderInSystem
              ? `of title (${folderInSystem.title}) ID=${folderInSystem.id} - LEVEL ${folder.level}`
              : ""
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
  console.log(
    `✔️ Handled Folder (${folder.id} => ${folderInSystem?.id}) of LEVEL ${folder.level}`
  );
}
