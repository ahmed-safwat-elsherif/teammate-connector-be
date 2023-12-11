import axiosTM from "../axios/teammate.js";
import axiosOData from "../axios/teammateOData.js";

export const getTeammateRisks = () =>
  axiosOData.get("/TeamStoreRisks").then((res) => res.data.value);

export const getTMRisk = (riskId) => axiosTM.get(`/Risks/${riskId}`);

export const createTMRisk = (title, parentFolderId) =>
  axiosTM.post("/Risk", {
    parentFolderId,
    title,
  });

export const removeTMRisk = (riskId) => axiosTM.delete(`/Risk/${riskId}`);
export const updateTMRisk = (riskId, title) =>
  axiosTM.patch(`/Risk/${riskId}`, [
    {
      path: "/title",
      op: "Replace",
      value: title,
    },
  ]);
