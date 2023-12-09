import axiosTM from "../axios/teammate.js";
import axiosOData from "../axios/teammateOData.js";

export const getTeammateRisks = () =>
  axiosOData.get("/TeamStoreRisks").then((res) => res.data.value);

export const getTeamStoreRisk = (riskId) => axiosTM.get(`/Risks/${riskId}`);
