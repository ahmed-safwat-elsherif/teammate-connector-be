import sequelize from '../../db/oneSumX.db.js';
import { query } from '../../queries/oneSumX/risks.js';

/**
 * @returns {{
 *   cabinets: Cabinet[];
 *   folders: Folder[];
 *   risks: Risk[];
 *   levels: number;
 * }}
 */
const getOneSumXData = async () => {
  try {
    const [rows] = await sequelize.query(query);
    return prepareRows(rows);
  } catch (error) {
    console.dir({ error });
    throw new Error("Couldn't get 'One Sum X' risks");
  }
};

export default getOneSumXData;

/* ------------------ Helpers --------------------*/

/** @param {OneSumXRisk[]} rows */
function prepareRows(rows) {
  const tree = new Map();
  const risks = new Map();
  rows.forEach(row => {
    if (row.ORG_ID_Level1) {
      if (!tree.has(row.ORG_ID_Level1)) {
        tree.set(row.ORG_ID_Level1, {
          id: row.ORG_ID_Level1,
          title: row.ORG_NAME_Level1,
          parentId: null,
        });
      }
    }

    if (row.ORG_ID_Level2) {
      const parentId = row.ORG_ID_Level1
      if (!tree.has(row.ORG_ID_Level2)) {
        tree.set(row.ORG_ID_Level2, {
          id: row.ORG_ID_Level2,
          title: row.ORG_NAME_Level2,
          parentId,
        });
      } else {
        tree.get(row.ORG_ID_Level2).parentId = parentId;
      }
    }

    if (row.ORG_ID_Level3) {
      const parentId = row.ORG_ID_Level2 || row.ORG_ID_Level1
      if (!tree.has(row.ORG_ID_Level3)) {
        tree.set(row.ORG_ID_Level3, {
          id: row.ORG_ID_Level3,
          title: row.ORG_NAME_Level3,
          parentId,
        });
      } else {
        tree.get(row.ORG_ID_Level3).parentId = parentId;
      }
    }
    
    if (row.ORG_ID_Level4) {
      const parentId = row.ORG_ID_Level3 || row.ORG_ID_Level2 || row.ORG_ID_Level1
      if (!tree.has(row.ORG_ID_Level4)) {
        tree.set(row.ORG_ID_Level4, {
          id: row.ORG_ID_Level4,
          title: row.ORG_NAME_Level4,
          parentId,
        });
      } else {
        tree.get(row.ORG_ID_Level4).parentId = parentId;
      }
    }

    if (row.ACTIVITY_ID) {
      const parentId = row.ORG_ID_Level4 ||row.ORG_ID_Level3 || row.ORG_ID_Level2 || row.ORG_ID_Level1
      if (!tree.has(row.ACTIVITY_ID)) {
        tree.set(row.ACTIVITY_ID, {
          id: row.ACTIVITY_ID,
          title: row.ACTIVITY_NAME,
          parentId,
        });
      } else {
        tree.get(row.ACTIVITY_ID).parentId = parentId;
      }
    }

    if (row.PROCESS_ID) {
      const parentId = row.ACTIVITY_ID || row.ORG_ID_Level4 ||row.ORG_ID_Level3 || row.ORG_ID_Level2 || row.ORG_ID_Level1
      if (!tree.has(row.PROCESS_ID)) {
        tree.set(row.PROCESS_ID, {
          id: row.PROCESS_ID,
          title: row.PROCESS_DESC,
          parentId,
        });
      } else {
        tree.get(row.PROCESS_ID).parentId = parentId;
      }
    }

    // Risks
    if (row.risk_id && !risks.has(row.risk_id)) {
      const parentId = row.PROCESS_ID||row.ACTIVITY_ID || row.ORG_ID_Level4 ||row.ORG_ID_Level3 || row.ORG_ID_Level2 || row.ORG_ID_Level1

      risks.set(row.risk_id, {
        id: row.risk_id,
        title: row.risk_name,
        parentId,
      });
    }
  });

  const nodes = [...tree].map(([, node]) => node);

  nodes.forEach(node => {
    if (!node.parentId) {
      assignLevel(nodes, node, 0);
    }
  });
  const levels = Math.max(...nodes.map(node => node.level));
  const cabinets = nodes.filter(node => !node.parentId);
  const folders = nodes.filter(node => node.parentId || node.parentId === 0);
  return {
    cabinets,
    folders,
    levels,
    risks: [...risks].map(([, risk]) => risk),
  };
}

function assignLevel(nodes, node, level = 0) {
  node.level = level;
  const children = nodes.filter(item => item.parentId === node.id);
  children.forEach(child => {
    assignLevel(nodes, child, level + 1);
  });
}

// ---------------- JSDoc ------------------

/**
 * @typedef {{
 *   ORG_ID_Level1: number;
 *   ORG_ID_Level2: number;
 *   ORG_ID_Level3: number;
 *   ORG_ID_Level4: number;
 *   ORG_NAME_Level1: string;
 *   ORG_NAME_Level2: string;
 *   ORG_NAME_Level3: string;
 *   ORG_NAME_Level4: string;
 *   ACTIVITY_ID:number;
 *   ACTIVITY_NAME:string;
 *   PROCESS_ID:number;
 *   PROCESS_DESC:string;
 *   risk_id: number;
 *   risk_name: string;
 * }} OneSumXRisk
 *
 *
 * @typedef {{ id: number; title: string; level: number }} Cabinet
 *
 * @typedef {{ id: number; title: string; parentId: number; level: number }} Folder
 *
 * @typedef {{ id: number; title: string; parentId: number }} Risk
 *
 * @typedef {{ id: number; title: string; parentId: number }} Control
 */
