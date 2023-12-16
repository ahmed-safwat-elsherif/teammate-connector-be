import axiosTM from "../axios/teammate.js";
import axiosOData from "../axios/teammateOData.js";

export const getTeammateRisks = () =>
  axiosOData.get("/TeamStoreRisks").then((res) => res.data.value);

export const getTMRisk = (riskId) => axiosTM.get(`/Risks/${riskId}`);

export const createTMRisk = (title, parentFolderId) =>
  axiosTM.post("/Risks", {
    parentFolderId,
    title,
  });

export const removeTMRisk = (riskId) => axiosTM.delete(`/Risks/${riskId}`);

export const updateTMRisk = (riskId, title) =>
  axiosTM.patch(`/Risks/${riskId}`, [
    {
      path: "/title",
      op: "Replace",
      value: title,
    },
  ]);
