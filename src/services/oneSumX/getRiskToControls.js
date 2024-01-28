import sequelize from '../../db/oneSumX.db.js';
import { query } from '../../queries/oneSumX/controls.js';

/**
 * @returns {{
 *   controls: Control[];
 *   risksToControls: { riskId: number; controls: { controlId: number; controlDesc: string }[] }[];
 * }}
 */

const getRiskToControls = async () => {
  try {
    const [rows] = await sequelize.query(query);
    return prepareRows(rows);
  } catch (error) {
    throw new Error("Couldn't get 'One Sum X' controls");
  }
};

export default getRiskToControls;

/* ------------------ Helpers --------------------*/

/** @param {RiskToControlRow[]} rows */
function prepareRows(rows) {
  let controlsMapper = new Map();
  let riskToControlsMapper = new Map();
  rows.forEach(row => {
    const { RISK_ID: riskId, CONTROL_ID: id, CONTROL_DESC: title } = row;
    const ctrl = { id, title, riskId };
    if (!controlsMapper.has(id)) controlsMapper.set(id, ctrl);
    if (riskToControlsMapper.has(riskId)) {
      riskToControlsMapper.get(riskId).controls.push(ctrl);
    } else {
      riskToControlsMapper.set(riskId, {
        riskId,
        controls: [ctrl],
      });
    }
  });
  return {
    controls: [...controlsMapper].map(([, control]) => control),
    risksToControls: [...riskToControlsMapper].map(([, riskToControls]) => riskToControls),
  };
}

// ---------------- JSDoc ------------------

/** @typedef {{ id: number; title: string; riskId: number }} Control */
/** @typedef {{ RISK_ID: number; CONTROL_ID: number; CONTROL_DESC: string }} RiskToControlRow */
