import sequelize from '../../db/oneSumX.db.js';

const query = `
select 
  ou3.ORG_ID orgLevel1Id, 
  ou3.org_name orgLevel1Name,  
  ou2.ORG_ID orgLevel2Id, 
  ou2.org_name orgLevel2Name, 
  ou1.ORG_ID orgLevel3Id, 
  ou1.org_name orgLevel3Name,
  a.ACTIVITY_ID activityId,
  a.ACTIVITY_NAME activityName,
  p.PROCESS_ID processId, 
  p.PROCESS_DESC processDescription, 
  risk_id riskId, 
  risk_name riskName, 
  RISK_DESCRIPTION riskDescription, 
  rc.RISK_CATEGORY_ID riskCategoryID, 
  rc.RISK_CATEGORY_LONG_DESC riskCategoryDescription
from RISK r
left join RISK_CATEGORY rc on r.RISK_CATEGORY_ID=rc.RISK_CATEGORY_ID and rc.DELETED_FLAG='N'
join PROCESS p on r.PROCESS_ID=p.PROCESS_ID and p.DELETED_FLAG='N'
join ACTIVITY a on p.ACTIVITY_ID=a.ACTIVITY_ID and a.DELETED_FLAG='N'
join ORGANISATION_UNIT ou1 on a.ORG_ID=ou1.ORG_ID and ou1.DELETED_FLAG='N'
join ORGANISATION_UNIT ou2 on ou2.ORG_ID=ou1.PARENT_ORG and ou2.DELETED_FLAG='N'
join ORGANISATION_UNIT ou3 on ou3.ORG_ID=ou2.PARENT_ORG and ou3.DELETED_FLAG='N'
where r.DELETED_FLAG='N'
`;

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
    const formattedRows = structOneSumData(rows);
    return formattedRows;
  } catch (error) {
    console.dir({ error });
    throw new Error("Couldn't get 'One Sum X' risks");
  }
};

export default getOneSumXData;

/* ------------------ Helpers --------------------
/**
 *
 * @param {OneSumXRisk[]} rows
 */
function structOneSumData(rows) {
  const tree = new Map();
  const risks = new Map();
  rows.forEach(row => {
    if (!tree.has(row.orgLevel1Id)) {
      tree.set(row.orgLevel1Id, {
        parentId: null,
        id: row.orgLevel1Id,
        title: row.orgLevel1Name,
      });
    }

    if (!tree.has(row.orgLevel2Id)) {
      tree.set(row.orgLevel2Id, {
        parentId: row.orgLevel1Id,
        id: row.orgLevel2Id,
        title: row.orgLevel2Name,
      });
    } else {
      tree.get(row.orgLevel2Id).parentId = row.orgLevel1Id;
    }

    if (!tree.has(row.orgLevel3Id)) {
      tree.set(row.orgLevel3Id, {
        parentId: row.orgLevel2Id,
        id: row.orgLevel3Id,
        title: row.orgLevel3Name,
      });
    } else {
      tree.get(row.orgLevel3Id).parentId = row.orgLevel2Id;
    }

    // Calculate the

    // Risks
    if (!risks.has(row.riskId)) {
      risks.set(row.riskId, {
        id: row.riskId,
        title: row.riskName,
        parentId: row.orgLevel3Id,
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
 *   orgLevel1Id: number;
 *   orgLevel2Id: number;
 *   orgLevel3Id: number;
 *   orgLevel1Name: string;
 *   orgLevel2Name: string;
 *   orgLevel3Name: string;
 *   riskId: number;
 *   riskName: string;
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
