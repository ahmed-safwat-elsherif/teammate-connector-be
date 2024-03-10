import colors from 'colors';
import getOneSumXData from '../services/oneSumX/getOneSumXData.js';
import handleBulkCabinets from './handleBulkCabinets.js';
import handleBulkFolders from './handleBulkFolders.js';
import handleBulkRisks from './handleBulkRisks.js';
import handleBulkControls from './handleBulkControls.js';
import { FOLDER_TYPE_CONTROL, FOLDER_TYPE_RISK } from '../services/teammate/folders.js';
import getRiskToControls from '../services/oneSumX/getRiskToControls.js';
import syncManager from './syncManager.js';
import connectControlsToRisks from './connectControlsToRisks.js';
import { publishEmail } from '../services/email.js';
import SyncLogsBuilder from './SyncLogsBuilder.js';

export const SyncStatus = {
  Done: 'Done',
  Started: 'Started',
  InProgress: 'InProgress',
  Failed: 'Failed',
};

export default async () => {
  if (syncManager.inProgress) {
    return {
      message: 'Syncronization is still in progress',
      syncStatus: syncManager.status,
      progress: syncManager.progressPct,
    };
  }
  const result = { message: 'Syncronization triggered', syncStatus: syncManager.status };
  syncManager.startSync();
  main();
  publishEmail('Syncronization triggered');
  return result;
};

// ------- Handlers -------

async function main() {
  try {
    const oneSumData = await getOneSumXData();
    const { controls, risksToControls } = await getRiskToControls();
    const { cabinets, folders, risks, levels } = oneSumData;
    /**
     * Set the total number of sync operations = [Cabinets + Folders X 2 (For Risks and Controls) +
     * Risks + Controls + Linking between a given risk and set of controls ]
     */
    syncManager.setTotalSyncOperation(
      cabinets.length + folders.length * 2 + risks.length + controls.length + risksToControls.length
    );

    // handle cabinets
    SyncLogsBuilder.log('\n------------------------------');
    SyncLogsBuilder.log('      -:{ START Sync }:-     ');
    SyncLogsBuilder.log('------------------------------\n');

    // Cabinets:
    await handleBulkCabinets(cabinets);
    SyncLogsBuilder.log(colors.bgGreen.white('✔️ Cabinets syncronized'));
    // Risk Folders:
    SyncLogsBuilder.log(colors.bgYellow.black('\n------------------'));
    SyncLogsBuilder.log(colors.bgYellow.black('-- Risk Folders --'));
    SyncLogsBuilder.log(colors.bgYellow.black('------------------\n'));
    await syncFolders(folders, levels, FOLDER_TYPE_RISK);
    // Control Folders:
    SyncLogsBuilder.log(colors.bgYellow.black('\n------------------'));
    SyncLogsBuilder.log(colors.bgYellow.black('-- Control Folders --'));
    SyncLogsBuilder.log(colors.bgYellow.black('------------------\n'));
    await syncFolders(folders, levels, FOLDER_TYPE_CONTROL);
    // Risks:
    SyncLogsBuilder.log(colors.bgYellow.black('\n-----------'));
    SyncLogsBuilder.log(colors.bgYellow.black('-- Risks --'));
    SyncLogsBuilder.log(colors.bgYellow.black('-----------\n'));
    await handleBulkRisks(risks);
    // Controls
    SyncLogsBuilder.log(colors.bgYellow.black('\n-------------'));
    SyncLogsBuilder.log(colors.bgYellow.black('-- Controls --'));
    SyncLogsBuilder.log(colors.bgYellow.black('-------------\n'));
    await handleBulkControls(controls);
    // Connections
    await connectControlsToRisks(risksToControls);
    await SyncLogsBuilder.log('✅Syncronization done');
    syncManager.endSync();
  } catch (error) {
    SyncLogsBuilder.log('❌Syncronization failed');
    SyncLogsBuilder.log({ message: error.message });
    syncManager.endSync(true);
  }
  SyncLogsBuilder.saveAndFinalize();
}

async function syncFolders(folders, levels, folderType) {
  colors.bgCyan.white(
    `\n------------- FOLDER TYPE: ${
      folderType === FOLDER_TYPE_RISK ? 'RISK' : 'CONTROL'
    } -------------\n`
  );
  for (let level = 1; level <= levels; level++) {
    SyncLogsBuilder.log(colors.bgMagenta.white(`------------- LEVEL ${level} -------------`));
    const currentLevelFolders = folders.filter(folder => folder.level === level);
    await handleBulkFolders(currentLevelFolders, level > 1, folderType);
  }
}
