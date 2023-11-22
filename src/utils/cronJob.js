import { CronJob } from "cron";
import moment from "moment";

export const CRON_TYPES = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
};

// const job = new CronJob(
//   "0 27 21 20 11 *", // cronTime
//   function (data) {
//     console.log({ data });
//     console.log("You will see this message every second");
//   }, // onTick
//   null, // onComplete
//   true, // start
//   "America/Los_Angeles" // timeZone
// );
// job.start();

const parseTime = (time) => {
  let isValid = true;
  let data = null;
  try {
    const [hours, minutes, seconds] = time.split(":");
    data = {
      hours: hours ?? "*",
      minutes: minutes ?? "*",
      seconds: seconds ?? "*",
    };
  } catch (error) {
    isValid = false;
    data = null;
  }
  return { isValid, data };
};

export const createWeeklyCronJob = (weekDay, time, timeZone, onTick) => {
  const { hours, minutes, seconds } = time;
  const cronTime = `${seconds} ${minutes} ${hours} * * ${weekDay}`;
  return [CronJob.from({ cronTime, start: false, onTick, timeZone })];
};

export const revokeAllCronJobs = () => {
  cronJobs.forEach((job) => job.stop());
  cronJobs = [];
};

class CronJobFactory {
  /**
   * @type {CronJob[]}
   */
  cronJobs = [];

  clearAll() {
    this.cronJobs.forEach((job) => job.stop());
    this.cronJobs = [];
  }

  start(onTick, options) {
    const { type, time, weekDay, timezone } = options;
    if (!type) throw new Error("a cron job type should be specified");

    const { data: parsedTime, isValid } = parseTime(time);
    if (!isValid) throw new Error("Couldn't parse the given time");

    switch (type) {
      case CRON_TYPES.WEEKLY: {
        if ((!weekDay && weekDay !== 0) || weekDay < 0 || weekDay > 7) {
          throw new Error("Couldn't parse the given day of week");
        }
        this.cronJobs = createWeeklyCronJob(
          weekDay,
          parsedTime,
          timezone,
          onTick
        );

        break;
      }
      case CRON_TYPES.MONTHLY: {
        const { monthDay } = settings;
        if (!monthDay || monthDay < 1 || monthDay > 28) {
          throw new Error("Couldn't parse the given day of month");
        }

        break;
      }

      default:
        break;
    }
    this.cronJobs.forEach((job) => {
      job.start();
    });
  }
}

const cronJob = new CronJobFactory();

export default cronJob;
