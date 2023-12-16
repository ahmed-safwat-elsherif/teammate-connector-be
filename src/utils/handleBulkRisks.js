import colors from "colors";
import Risk from "../models/Risk.js";
import {
  createTMRisk,
  getTMRisk,
  removeTMRisk,
  updateTMRisk,
} from "../services/teammate/risks.js";
import RiskFolder from "../models/RiskFolder.js";
import asyncHolder from "./asyncHolder.js";

const MAX_RISKS_COUNT = 1000;
const BATCH_COUNT = 5;
/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Risk[]} risks
 */
export default async function handleBulkRisks(risks) {
  const risksCount = risks.length;
  const numOfBatches = Math.ceil(
    (risksCount < MAX_RISKS_COUNT ? risksCount : MAX_RISKS_COUNT) / BATCH_COUNT
  );
  let batches = [];
  for (let index = 0; index < numOfBatches; index++) {
    batches = risks.slice(
      index * BATCH_COUNT,
      index * BATCH_COUNT + BATCH_COUNT
    );

    console.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await asyncHolder(4000);
    await Promise.all(batches.map((risk) => handleRisk(risk)));
  }
}

/**
 * @param {import("../services/oneSumX/getOneSumXData.js").Risk} risk
 */
async function handleRisk(risk) {
  const { id: oneSumXId, title, parentId: oneSumXParentId } = risk;

  let riskInSystem = await Risk.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let riskInTM = null;
  parentInfo = await RiskFolder.findOne({
    where: { oneSumXId: oneSumXParentId },
  });
  if (!riskInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      riskInTM = await createTMRisk(title, parentInfo.id).then(
        (res) => res.data
      );
      riskInSystem = await Risk.create({
        id: riskInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
      });
    } catch (error) {
      if (riskInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMRisk(riskInTM.id);
      }
      throw new Error(
        `Couldn't create a Risk ${
          riskInTM ? `of title (${riskInTM.title})` : ""
        }`
      );
    }
  } else {
    const riskInSystemObj = riskInSystem.toJSON();
    const { data, error } = await getTMRisk(riskInSystemObj.id)
      .then((res) => ({ data: res.data }))
      .catch((err) => {
        if (err.response.status === 404) {
          return { data: null };
        }
        return { data: null, error: err.message };
      });
    riskInTM = data;
    if (error)
      throw new Error(
        `Couldn't update a Risk ${
          riskInSystem
            ? `of title (${riskInSystem.title}) ID=${riskInSystem.id}`
            : ""
        }`
      );
    if (!riskInTM) {
      riskInTM = await createTMRisk(title, parentInfo.id).then(
        (res) => res.data
      );
    } else {
      try {
        riskInTM = await updateTMRisk(riskInSystem.id, title).then(
          (res) => res.data
        );
      } catch (error) {
        throw new Error(
          `Couldn't update a Risk ${
            riskInSystem
              ? `of title (${riskInSystem.title}) ID=${riskInSystem.id}`
              : ""
          }`
        );
      }
    }
    riskInSystem.title = title;
    if (riskInTM) {
      riskInSystem.id = riskInTM.id;
    }
    await riskInSystem.save();
  }
  console.log(`✔️ Handled Risk (${risk.id} => ${riskInSystem?.id}) `);
}
