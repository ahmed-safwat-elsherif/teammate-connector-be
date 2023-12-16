import { linkControlsToOneRisk } from "../services/teammate/folders";

/**
 * @param {{riskId:number, controls:{controlId:number, controlDesc:string}[]}[]} risksToControls
 */
export default async (risksToControls) => {
  for (let index = 0; index < risksToControls.length; index++) {
    const riskToControls = risksToControls[index];
    await linkControlsToOneRisk(
      riskToControls.riskId,
      riskToControls.controls.map((c) => c.controlId)
    );
  }
};
