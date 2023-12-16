import colors from "colors";
import ControlFolder from "../models/ControlFolder.js";
import Control from "../models/Control.js";
import {
  createTMControl,
  getTMControl,
  removeTMControl,
  updateTMControl,
} from "../services/teammate/controls.js";
import asyncHolder from "./asyncHolder.js";

const MAX_CONTROLS_COUNT = 1000;
const BATCH_COUNT = 5;
/**
 * @param {import("../services/oneSumX/getRiskToControls.js").Control[]} controls
 */
export default async function handleBulkControls(controls) {
  const controlsCount = controls.length;
  const numOfBatches = Math.ceil(
    (controlsCount < MAX_CONTROLS_COUNT ? controlsCount : MAX_CONTROLS_COUNT) /
      BATCH_COUNT
  );
  let batches = [];
  for (let index = 0; index < numOfBatches; index++) {
    batches = controls.slice(
      index * BATCH_COUNT,
      index * BATCH_COUNT + BATCH_COUNT
    );

    console.log(colors.bold.blue(`--------- BATCH ${index} ---------`));
    await asyncHolder(4000);
    await Promise.all(batches.map((control) => handleControl(control)));
  }
}

/**
 * @param {import("../services/oneSumX/getRiskToControls.js").Control} control
 */
async function handleControl(control) {
  const { id: oneSumXId, title, parentId: oneSumXParentId } = control;

  let controlInSystem = await Control.findOne({ where: { oneSumXId } });
  let parentInfo = null;
  let controlInTM = null;
  parentInfo = await ControlFolder.findOne({
    where: { oneSumXId: oneSumXParentId },
  });
  if (!controlInSystem) {
    try {
      // Add the cabinet for both Sync System & Teammate databases
      controlInTM = await createTMControl(title, parentInfo.id).then(
        (res) => res.data
      );
      controlInSystem = await Control.create({
        id: controlInTM?.id,
        title,
        parentId: parentInfo.id,
        oneSumXId,
      });
    } catch (error) {
      if (controlInTM) {
        // Revert back if cabinet is already created in Teammate
        await removeTMControl(controlInTM.id);
      }
      throw new Error(
        `Couldn't create a Control ${
          controlInTM ? `of title (${controlInTM.title})` : ""
        }`
      );
    }
  } else {
    const controlInSystemObj = controlInSystem.toJSON();
    const { data, error } = await getTMControl(controlInSystemObj.id)
      .then((res) => ({ data: res.data }))
      .catch((err) => {
        if (err.response.status === 404) {
          return { data: null };
        }
        return { data: null, error: err.message };
      });
    controlInTM = data;
    if (error)
      throw new Error(
        `Couldn't update a Control ${
          controlInSystem
            ? `of title (${controlInSystem.title}) ID=${controlInSystem.id}`
            : ""
        }`
      );
    if (!controlInTM) {
      controlInTM = await createTMControl(title, parentInfo.id).then(
        (res) => res.data
      );
    } else {
      try {
        controlInTM = await updateTMControl(controlInSystem.id, title).then(
          (res) => res.data
        );
      } catch (error) {
        throw new Error(
          `Couldn't update a Control ${
            controlInSystem
              ? `of title (${controlInSystem.title}) ID=${controlInSystem.id}`
              : ""
          }`
        );
      }
    }
    controlInSystem.title = title;
    if (controlInTM) {
      controlInSystem.id = controlInTM.id;
    }
    await controlInSystem.save();
  }
  console.log(`✔️ Handled Control (${control.id} => ${controlInSystem?.id}) `);
}
