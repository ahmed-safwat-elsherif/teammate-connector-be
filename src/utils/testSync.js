import getOneSumXData from "../services/oneSumX/getOneSumXData.js";
import handleBulkCabinets from "./handleBulkCabinets.js";
import handleBulkFolders from "./handleBulkFolders.js";

export default async () => {
  const oneSumData = await getOneSumXData();
  const { cabinets, folders } = oneSumData;
  // handle cabinets
  // await handleBulkCabinets(cabinets);
  await handleBulkFolders(folders);
  console.log("FINISH>>>>>>>");
  return oneSumData;
};

// ------- Handlers -------
