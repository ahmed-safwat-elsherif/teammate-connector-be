export const query = `
select  ou1.ORG_ID as ORG_ID_Level1, ou1.org_name as ORG_NAME_Level1,  ou2.ORG_ID  as ORG_ID_Level2, ou2.org_name  as ORG_NAME_Level2,
ou3.ORG_ID  as ORG_ID_Level3,ou3.org_name  as ORG_NAME_Level3,ou4.ORG_ID  as ORG_ID_Level4, ou4.org_name  as ORG_NAME_Level4,
a.ACTIVITY_ID,a.ACTIVITY_NAME,
 p.PROCESS_ID, p.PROCESS_DESC, risk_id, risk_name, RISK_DESCRIPTION, rc.RISK_CATEGORY_ID, cast( rc.RISK_CATEGORY_LONG_DESC as nvarchar)
from RISK r
left join RISK_CATEGORY rc on r.RISK_CATEGORY_ID=rc.RISK_CATEGORY_ID and rc.DELETED_FLAG='N'
join PROCESS p on r.PROCESS_ID=p.PROCESS_ID and p.DELETED_FLAG='N'
join ACTIVITY a on p.ACTIVITY_ID=a.ACTIVITY_ID and a.DELETED_FLAG='N'
join ORGANISATION_UNIT ou4 on a.ORG_ID=ou4.ORG_ID and ou4.DELETED_FLAG='N'
join ORGANISATION_UNIT ou3 on ou3.ORG_ID=ou4.PARENT_ORG and ou3.DELETED_FLAG='N'
join ORGANISATION_UNIT ou2 on ou2.ORG_ID=ou3.PARENT_ORG and ou2.DELETED_FLAG='N'
join ORGANISATION_UNIT ou1 on ou1.ORG_ID=ou2.PARENT_ORG and ou1.DELETED_FLAG='N'
where r.DELETED_FLAG='N' and ou4.ORG_UNIT_LEVEL_ID=3

union

select  ou1.ORG_ID as ORG_ID_Level1, ou1.org_name as ORG_NAME_Level1,  ou2.ORG_ID  as ORG_ID_Level2, ou2.org_name  as ORG_NAME_Level2,
ou3.ORG_ID  as ORG_ID_Level3,ou3.org_name  as ORG_NAME_Level3,null  as ORG_ID_Level4, null  as ORG_NAME_Level4,
a.ACTIVITY_ID,a.ACTIVITY_NAME,
 p.PROCESS_ID, p.PROCESS_DESC, risk_id, risk_name, RISK_DESCRIPTION, rc.RISK_CATEGORY_ID, cast( rc.RISK_CATEGORY_LONG_DESC as nvarchar)
from RISK r
left join RISK_CATEGORY rc on r.RISK_CATEGORY_ID=rc.RISK_CATEGORY_ID and rc.DELETED_FLAG='N'
join PROCESS p on r.PROCESS_ID=p.PROCESS_ID and p.DELETED_FLAG='N'
join ACTIVITY a on p.ACTIVITY_ID=a.ACTIVITY_ID and a.DELETED_FLAG='N'
join ORGANISATION_UNIT ou3 on a.ORG_ID=ou3.ORG_ID  and ou3.DELETED_FLAG='N'
join ORGANISATION_UNIT ou2 on ou2.ORG_ID=ou3.PARENT_ORG and ou2.DELETED_FLAG='N'
join ORGANISATION_UNIT ou1 on ou1.ORG_ID=ou2.PARENT_ORG and ou1.DELETED_FLAG='N'
where r.DELETED_FLAG='N' and ou3.ORG_UNIT_LEVEL_ID=2

union

select  ou1.ORG_ID as ORG_ID_Level1, ou1.org_name as ORG_NAME_Level1,  ou2.ORG_ID  as ORG_ID_Level2, ou2.org_name  as ORG_NAME_Level2,
null  as ORG_ID_Level3,null as ORG_NAME_Level3,null  as ORG_ID_Level4, null  as ORG_NAME_Level4,
a.ACTIVITY_ID,a.ACTIVITY_NAME,
 p.PROCESS_ID, p.PROCESS_DESC, risk_id, risk_name, RISK_DESCRIPTION, rc.RISK_CATEGORY_ID, cast( rc.RISK_CATEGORY_LONG_DESC as nvarchar)
from RISK r
left join RISK_CATEGORY rc on r.RISK_CATEGORY_ID=rc.RISK_CATEGORY_ID and rc.DELETED_FLAG='N'
join PROCESS p on r.PROCESS_ID=p.PROCESS_ID and p.DELETED_FLAG='N'
join ACTIVITY a on p.ACTIVITY_ID=a.ACTIVITY_ID and a.DELETED_FLAG='N'
join ORGANISATION_UNIT ou2 on a.ORG_ID=ou2.ORG_ID  and ou2.DELETED_FLAG='N'
join ORGANISATION_UNIT ou1 on ou1.ORG_ID=ou2.PARENT_ORG and ou1.DELETED_FLAG='N'
where r.DELETED_FLAG='N' and ou2.ORG_UNIT_LEVEL_ID=1

union

select  ou1.ORG_ID as ORG_ID_Level1, ou1.org_name as ORG_NAME_Level1,  null  as ORG_ID_Level2, null  as ORG_NAME_Level2,
null  as ORG_ID_Level3,null  as ORG_NAME_Level3,null  as ORG_ID_Level4, null  as ORG_NAME_Level4,
a.ACTIVITY_ID,a.ACTIVITY_NAME,
 p.PROCESS_ID, p.PROCESS_DESC, risk_id, risk_name, RISK_DESCRIPTION, rc.RISK_CATEGORY_ID, cast( rc.RISK_CATEGORY_LONG_DESC as nvarchar)
from RISK r
left join RISK_CATEGORY rc on r.RISK_CATEGORY_ID=rc.RISK_CATEGORY_ID and rc.DELETED_FLAG='N'
join PROCESS p on r.PROCESS_ID=p.PROCESS_ID and p.DELETED_FLAG='N'
join ACTIVITY a on p.ACTIVITY_ID=a.ACTIVITY_ID and a.DELETED_FLAG='N'
join ORGANISATION_UNIT ou1 on a.ORG_ID=ou1.ORG_ID  and ou1.DELETED_FLAG='N'
where r.DELETED_FLAG='N' and ou1.ORG_UNIT_LEVEL_ID=0
`;
