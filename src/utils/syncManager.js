let isSyncInProgress = false;

export const getSyncStatus = () => isSyncInProgress;

export const startSync = () => {
  isSyncInProgress = true;
};

export const endSync = () => {
  isSyncInProgress = false;
};
