import colors from "colors";
import getOneSumXData from "../services/oneSumX/getOneSumXData.js";
import handleBulkCabinets from "./handleBulkCabinets.js";
import handleBulkFolders from "./handleBulkFolders.js";
import handleBulkRisks from "./handleBulkRisks.js";
import {
  FOLDER_TYPE_CONTROL,
  FOLDER_TYPE_RISK,
} from "../services/teammate/folders.js";

export default async () => {
  const oneSumData = await getOneSumXData();
  const { cabinets, folders, risks, levels } = oneSumData;
  // handle cabinets
  console.log("\n      -:{ START Sync }:-     \n");
  await handleBulkCabinets(cabinets);
  console.log(colors.bgGreen.white("✔️ Cabinets syncronized"));
  setTimeout(async () => {
    try {
      console.log(colors.bgYellow.black("\n------------------"));
      console.log(colors.bgYellow.black("-- Risk Folders --"));
      console.log(colors.bgYellow.black("------------------\n"));
      await syncFolders(folders, levels, FOLDER_TYPE_RISK);
      console.log(colors.bgYellow.black("\n------------------"));
      console.log(colors.bgYellow.black("-- Control Folders --"));
      console.log(colors.bgYellow.black("------------------\n"));
      await syncFolders(folders, levels, FOLDER_TYPE_CONTROL);
      // await handleBulkRisks(risks);
      console.log("✅Syncronization done");
    } catch (error) {
      console.log("❌Syncronization failed");
      console.log({ message: error.message });
    }
  }, 5000);
  return oneSumData;
};

// ------- Handlers -------

async function syncFolders(folders, levels, folderType) {
  for (let level = 1; level <= levels; level++) {
    console.log(
      colors.bgMagenta.white(`------------- LEVEL ${level} -------------`)
    );
    const currentLevelFolders = folders.filter(
      (folder) => folder.level === level
    );
    await handleBulkFolders(currentLevelFolders, level > 1, folderType);
  }
}
