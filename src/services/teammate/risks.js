import axiosTM from "../axios/teammate.js";

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
