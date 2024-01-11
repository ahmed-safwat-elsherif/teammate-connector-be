import colors from 'colors';
import getOneSumXData from '../services/oneSumX/getOneSumXData.js';
import handleBulkCabinets from './handleBulkCabinets.js';
import handleBulkFolders from './handleBulkFolders.js';
import handleBulkRisks from './handleBulkRisks.js';
import handleBulkControls from './handleBulkControls.js';
import { FOLDER_TYPE_CONTROL, FOLDER_TYPE_RISK } from '../services/teammate/folders.js';
import getRiskToControls from '../services/oneSumX/getRiskToControls.js';
import { endSync, getSyncStatus, startSync } from './syncManager.js';
import connectControlsToRisks from './connectControlsToRisks.js';

export default async () => {
  const isSyncInProgress = getSyncStatus();
  if (isSyncInProgress) return 'Syncronization is still in progress';
  main();
  return 'Syncronization triggered';
};

// ------- Handlers -------

async function main() {
  startSync();
  try {
    const oneSumData = await getOneSumXData();
    const { controls, risksToControls } = await getRiskToControls();
    const { cabinets, folders, risks, levels } = oneSumData;
    // handle cabinets
    console.log('\n------------------------------');
    console.log('      -:{ START Sync }:-     ');
    console.log('------------------------------\n');

    // Cabinets:
    await handleBulkCabinets(cabinets);
    console.log(colors.bgGreen.white('✔️ Cabinets syncronized'));
    // Risk Folders:
    console.log(colors.bgYellow.black('\n------------------'));
    console.log(colors.bgYellow.black('-- Risk Folders --'));
    console.log(colors.bgYellow.black('------------------\n'));
    await syncFolders(folders, levels, FOLDER_TYPE_RISK);
    // Control Folders:
    console.log(colors.bgYellow.black('\n------------------'));
    console.log(colors.bgYellow.black('-- Control Folders --'));
    console.log(colors.bgYellow.black('------------------\n'));
    await syncFolders(folders, levels, FOLDER_TYPE_CONTROL);
    // Risks:
    console.log(colors.bgYellow.black('\n-----------'));
    console.log(colors.bgYellow.black('-- Risks --'));
    console.log(colors.bgYellow.black('-----------\n'));
    await handleBulkRisks(risks);
    // Controls
    console.log(colors.bgYellow.black('\n-------------'));
    console.log(colors.bgYellow.black('-- Controls --'));
    console.log(colors.bgYellow.black('-------------\n'));
    await handleBulkControls(controls);
    // Connections
    await connectControlsToRisks(risksToControls);
    await console.log('✅Syncronization done');
  } catch (error) {
    console.log('❌Syncronization failed');
    console.log({ message: error.message });
  }
  endSync();
}

async function syncFolders(folders, levels, folderType) {
  colors.bgCyan.white(
    `\n------------- FOLDER TYPE: ${
      folderType === FOLDER_TYPE_RISK ? 'RISK' : 'CONTROL'
    } -------------\n`
  );
  for (let level = 1; level <= levels; level++) {
    console.log(colors.bgMagenta.white(`------------- LEVEL ${level} -------------`));
    const currentLevelFolders = folders.filter(folder => folder.level === level);
    await handleBulkFolders(currentLevelFolders, level > 1, folderType);
  }
}
