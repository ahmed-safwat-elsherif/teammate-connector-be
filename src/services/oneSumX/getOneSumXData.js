import sequelize from "../../db/oneSumX.db.js";

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
 * @returns {Promise<{
 * [cabinet:string]:{
 *  cabinetId:number,
 *  cabinetName:string,
 *  children:{
 *   [folderLevel1:string]:{
 *       folderId:number,
 *       folderName:string,
 *       children:{
 *          [folderLevel2:string]:{
 *               folderId:number,
 *               folderName:string,
 *               children:{
 *                  [folderLevel3:string]:{
 *                      folderId:number,
 *                      folderName:string,
 *                      risks:{riskId:number, riskName:string}[]
 *                  }
 *               }
 *          }
 *       }
 *   }
 *  }
 * }
 * }>}
 */
const getOneSumXData = async () => {
  try {
    const [data] = await sequelize.query(query);
    const formattedData = structOneSumData(data);
    return formattedData;
  } catch (error) {
    throw new Error("Couldn't get 'One Sum X' risks");
  }
};

export default getOneSumXData;

/**
 *
 * @param {{
 * orgLevel1Id:number,
 * orgLevel2Id:number,
 * orgLevel3Id:number,
 * orgLevel1Name:string,
 * orgLevel2Name:string,
 * orgLevel3Name:string,
 * riskId:number,
 * riskName:string
 * }[]} data
 */
function structOneSumData(data) {
  const out = {};
  data.forEach((row) => {
    const cabinet = out[row.orgLevel1Id];
    if (cabinet) {
      const folderLevel1 = cabinet.children[row.orgLevel2Id];
      if (folderLevel1) {
        const folderLevel2 = folderLevel1.children[row.orgLevel3Id];
        if (folderLevel2) {
          folderLevel2.risks.push({
            riskId: row.riskId,
            riskName: row.riskName,
          });
        } else {
          folderLevel1.children[row.orgLevel3Id] = {
            folderId: row.orgLevel3Id,
            folderName: row.orgLevel3Name,
            risks: [
              {
                riskId: row.riskId,
                riskName: row.riskName,
              },
            ],
          };
        }
      } else {
        cabinet.children[row.orgLevel2Id] = {
          folderId: row.orgLevel2Id,
          folderName: row.orgLevel2Name,
          children: {
            [row.orgLevel3Id]: {
              folderId: row.orgLevel3Id,
              folderName: row.orgLevel3Name,
              risks: [
                {
                  riskId: row.riskId,
                  riskName: row.riskName,
                },
              ],
            },
          },
        };
      }
    } else {
      out[row.orgLevel1Id] = {
        cabinetId: row.orgLevel1Id,
        cabinetName: row.orgLevel1Name,
        children: {
          [row.orgLevel2Id]: {
            folderId: row.orgLevel2Id,
            folderName: row.orgLevel2Name,
            children: {
              [row.orgLevel3Id]: {
                folderId: row.orgLevel3Id,
                folderName: row.orgLevel3Name,
                risks: [
                  {
                    riskId: row.riskId,
                    riskName: row.riskName,
                  },
                ],
              },
            },
          },
        },
      };
    }
  });
  return out;
}
