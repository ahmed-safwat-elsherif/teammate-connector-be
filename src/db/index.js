import colors from "colors";
import sequelizeTM from "./teammate.db.js";
import sequelizeOS from "./oneSumX.db.js";

try {
  await Promise.all([sequelizeTM.authenticate(), sequelizeOS.authenticate()]);
  console.log(colors.green("✅ Connection has been established successfully."));
} catch (error) {
  console.log(colors.red("❌ Unable to connect to the database:"));
  console.dir(error);
}

export { sequelizeTM, sequelizeOS };
