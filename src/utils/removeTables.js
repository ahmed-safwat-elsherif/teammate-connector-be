import Cabinet from "../models/cabinet.js";

import Control from "../models/Control.js";
import ControlFolder from "../models/ControlFolder.js";
import Risk from "../models/risk.js";
import RiskFolder from "../models/RiskFolder.js";

export default async () => {
  await Promise.all([
    Cabinet.truncate(),
    // Risks
    Risk.truncate(),
    RiskFolder.truncate(),
    // Controls
    Control.truncate(),
    ControlFolder.truncate(),
  ]);
};
