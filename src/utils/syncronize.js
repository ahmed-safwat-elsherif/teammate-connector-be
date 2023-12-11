import colors from "colors";
import getOneSumXData from "../services/oneSumX/getOneSumXData.js";
import handleBulkCabinets from "./handleBulkCabinets.js";
import handleBulkFolders from "./handleBulkFolders.js";
import handleBulkRisks from "./handleBulkRisks.js";

export default async () => {
  const oneSumData = await getOneSumXData();
  const { cabinets, folders, risks, levels } = oneSumData;
  // handle cabinets
  console.log("\n      -:{ START Sync }:-     \n");
  await handleBulkCabinets(cabinets);
  console.log(colors.bgGreen.white("✔️ Cabinets syncronized"));
  setTimeout(async () => {
    try {
      await syncFolders(folders, levels);
      await handleBulkRisks(risks);
      console.log("✅Syncronizarion done");
    } catch (error) {
      console.log("❌Syncronizarion failed");
      console.log({ message: error.message });
    }
  }, 5000);
  return oneSumData;
};

// ------- Handlers -------

async function syncFolders(folders, levels) {
  for (let level = 1; level <= levels; level++) {
    console.log(
      colors.bgMagenta.white(`------------- LEVEL ${level} -------------`)
    );
    const currentLevelFolders = folders.filter(
      (folder) => folder.level === level
    );
    await handleBulkFolders(currentLevelFolders, level > 1);
  }
}
