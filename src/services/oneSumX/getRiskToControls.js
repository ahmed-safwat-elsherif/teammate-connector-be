import sequelize from '../../db/oneSumX.db.js';

const query = `
select 
  cr.RISK_ID riskId, 
  c.CONTROL_ID controlId,
  c.CONTROL_DESC controlDesc, 
  c.CONTROL_TEXT controlText, 
  c.CONTROL_TYPE_CODE, 
  st.CONTROL_TYPE_DESC, 
  c.CONTROL_CLASSIFICATION, 
  f.FREQUENCY_CODE, 
  f.FREQUENCY_DESC, 
  c.FREQUENCY_MONTH

  from CONTROL c
  join CONTROL_FOR_RISK cr on c.CONTROL_ID=cr.CONTROL_ID and cr.DELETED_FLAG='N'

  left join SOX_CONTROL_TYPE st on c.CONTROL_TYPE_CODE=st.CONTROL_TYPE_CODE

  left join FREQUENCY f on c.FREQUENCY_CODE=f.FREQUENCY_CODE

  where c.DELETED_FLAG='N';
`;

/**
 * @returns {{
 *   controls: Control[];
 *   risksToControls: { riskId: number; controls: { controlId: number; controlDesc: string }[] }[];
 * }}
 */

const getRiskToControls = async () => {
  try {
    const [rows] = await sequelize.query(query);
    let controlsMapper = new Map();
    let riskToControlsMapper = new Map();
    // TODO: unslice rows
    rows.slice(0, 300).forEach(row => {
      const { riskId, controlId: id, controlDesc: title } = row;
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
  } catch (error) {
    throw new Error("Couldn't get 'One Sum X' controls");
  }
};

export default getRiskToControls;

// ---------------- JSDoc ------------------

/** @typedef {{ id: number; title: string; riskId: number }} Control */
