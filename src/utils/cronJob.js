import { CronJob } from 'cron';
import moment from 'moment';
import { readSettings, writeSettings } from './settings.js';
import syncronize from './syncronize.js';

class CronJobFactory {
  /** @type {CronJob[]} */
  cronJobs = [];
  /** @type {keyof typeof CRON_TYPES} */
  type = null;
  /**
   * @type {{
   *   hours: string | number | '*';
   *   minutes: string | number | '*';
   *   seconds: string | number | '*';
   * }}
   */
  time = {
    hours: '*',
    minutes: '*',
    seconds: '*',
  };
  weekDay = 0;
  monthDay = null;
  /** @type {string[]} */
  quarterMonths = [];

  clearAll() {
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
  }

  getSettings() {
    const time = timeObjToStr(this.time);

    return {
      time,
      type: this.type,
      weekDay: this.weekDay,
      monthDay: this.monthDay,
      quarterMonths: this.quarterMonths,
    };
  }

  async setConfig(options) {
    const { type, time, weekDay, monthDay, quarterMonths, timezone } = options;
    if (!type) throw new Error('a cron job type should be specified');
    this.type = type;
    const { data: parsedTime, isValid } = parseTime(time);
    this.time = parsedTime;

    if (!isValid) throw new Error("Couldn't parse the given time");

    switch (type) {
      case CRON_TYPES.WEEKLY: {
        if (isValidWeekDay(weekDay)) {
          throw new Error("Couldn't parse the given day of week");
        }
        this.weekDay = weekDay;
        this.cronJobs = createWeeklyCronJob(weekDay, parsedTime, timezone, syncronize);

        break;
      }

      case CRON_TYPES.MONTHLY: {
        if (isValidMonthDay(monthDay)) {
          throw new Error("Couldn't parse the given day of month");
        }

        this.monthDay = monthDay;
        this.cronJobs = createMonthlyCronJob(monthDay, parsedTime, timezone, syncronize);
        break;
      }

      case CRON_TYPES.QUARTERLY: {
        const { error } = validateQuarters(quarterMonths);

        if (error) throw new Error(error);

        this.quarterMonths = quarterMonths;
        this.cronJobs = createQuartersCronJob(quarterMonths, parsedTime, timezone, syncronize);
        break;
      }

      default:
        break;
    }
    this.start();
  }

  async persistConfig() {
    const settings = this.getSettings();
    await writeSettings(settings);
  }

  start() {
    this.cronJobs.forEach(job => job.start());
  }

  destroyAll() {
    this.cronJobs.forEach(job => job.stop());
  }
}

const cronJob = new CronJobFactory();

(async () => {
  // Init the pre-saved config:
  const preSavedSettings = await readSettings();
  cronJob.setConfig(preSavedSettings);
})();

export default cronJob;

//==============================================================================================================
//================================================== UTILS =====================================================
//==============================================================================================================

export const CRON_TYPES = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
};

const parseTime = time => {
  let isValid = true;
  let data = null;
  try {
    const [hours, minutes, seconds] = time.split(':');
    data = {
      hours: hours ?? '*',
      minutes: minutes ?? '*',
      seconds: seconds ?? '*',
    };
  } catch (error) {
    isValid = false;
    data = null;
  }
  return { isValid, data };
};

const timeObjToStr = time => {
  const { hours, minutes, seconds } = time;
  return hours !== '*' && minutes !== '*' && seconds !== '*'
    ? `${hours}:${minutes}:${seconds}`
    : null;
};

const createWeeklyCronJob = (weekDay, time, timeZone, onTick) => {
  const { hours, minutes, seconds } = time;
  const cronTime = `${seconds} ${minutes} ${hours} * * ${weekDay}`;
  return [CronJob.from({ cronTime, start: false, onTick, timeZone })];
};

const createMonthlyCronJob = (monthDay, time, timeZone, onTick) => {
  const { hours, minutes, seconds } = time;
  const cronTime = `${seconds} ${minutes} ${hours} ${monthDay} * *`;
  return [CronJob.from({ cronTime, start: false, onTick, timeZone })];
};
/** @param {string[]} quarterMonths */
const createQuartersCronJob = (quarterMonths, time, timeZone, onTick) => {
  const { hours, minutes, seconds } = time;

  return quarterMonths.map(quarterDay =>
    CronJob.from({
      cronTime: `${seconds} ${minutes} ${hours} ${moment(quarterDay).format('D')} ${moment(
        quarterDay
      ).format('M')} *`,
      start: false,
      onTick,
      timeZone,
    })
  );
};

const isValidWeekDay = weekDay => (!weekDay && weekDay !== 0) || weekDay < 0 || weekDay > 7;

const isValidMonthDay = monthDay => !monthDay || monthDay < 1 || monthDay > 28;

/** @param {string[]} quarterMonths */
const validateQuarters = quarterMonths => {
  if (!quarterMonths?.length) return { error: "Couldn't find the quarter days" };

  const isAllValidDates = quarterMonths.every(quarterDay => moment(quarterDay).isValid());

  if (!isAllValidDates) return { error: 'Quarter day(s) are invalid!' };

  return { error: null };
};
