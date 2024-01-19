import Control from '../models/Control.js';
import Risk from '../models/risk.js';
import { linkControlsToOneRisk } from '../services/teammate/folders.js';

/** @param {{ riskId: number; controls: { controlId: number; controlDesc: string }[] }[]} risksToControls */
export default async risksToControls => {
  for (let index = 0; index < risksToControls.length; index++) {
    const riskToControls = risksToControls[index];
    const riskInSystem = await Risk.findOne({ where: { oneSumXId: riskToControls.riskId } });
    if (riskInSystem) {
      const controls = await Control.findAll({ where: { riskOsxId: riskToControls.riskId } });
      await linkControlsToOneRisk(
        riskInSystem.id,
        controls.map(c => c.id)
      );
    }
  }
};
