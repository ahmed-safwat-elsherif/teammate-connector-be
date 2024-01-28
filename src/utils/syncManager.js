export const SyncStatus = {
  Done: 'Done',
  InProgress: 'InProgress',
  Failed: 'Failed',
};

class SyncManager {
  #progress = 0;
  #totalProgress = 0;
  /** @type {keyof typeof SyncStatus | null} */
  #status = null;
  get inProgress() {
    return this.#status === SyncStatus.InProgress;
  }

  get done() {
    return !this.#status || this.#status === SyncStatus.Done;
  }

  get failed() {
    return this.#status === SyncStatus.Failed;
  }

  get status() {
    return this.#status;
  }

  get progressPct() {
    if (isNaN(this.#progress)) return null;
    return this.#progress !== 0
      ? +((this.#progress * 100) / this.#totalProgress).toFixed(1)
      : this.#progress;
  }

  startSync() {
    this.#status = SyncStatus.InProgress;
    this.#progress = 0;
  }

  endSync(failed = false) {
    this.#status = failed ? SyncStatus.Failed : SyncStatus.Done;
    this.#progress = 0;
    this.#totalProgress = 0;
  }

  updateProgress(tick = 1) {
    if (this.#totalProgress - this.#progress >= tick) this.#progress += tick;
    return +((this.#progress * 100) / this.#totalProgress).toFixed(1);
  }

  setTotalSyncOperation(total) {
    this.#totalProgress = total;
  }
}

export default new SyncManager();
