import Folder from "../models/folder.js";
import {
  FOLDER_TYPE_RISK,
  createTMFolder,
} from "../services/teammate/folders.js";

/**
 *
 * @param {[string, import("../services/oneSumX/getOneSumXData.js").Folder][]} folders
 */
export default async function handleBulkFolders(folders) {
  await Promise.all(
    folders.map(async ([, folder]) => {
      const { id: oneSumXId, title, parentIsFolder, parentId } = folder;
      let folderInSystem = await Folder.findOne({ where: { oneSumXId } });
      let folderInTM = null;
      console.log(folderInSystem);
      if (!folderInSystem) {
        try {
          // Add the cabinet for both Sync System & Teammate databases
          folderInTM = await createTMFolder({
            title,
            parentId,
            folderType: FOLDER_TYPE_RISK,
            parentIsFolder,
          }).then((res) => res.data);
          await Folder.create({ id: folderInTM.id, oneSumXId, title });
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
      }
    })
  );
}
