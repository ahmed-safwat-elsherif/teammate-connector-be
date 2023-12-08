import axiosOData from "../axios/teammateOData.js";

export const getTeammateRisks = () =>
  axiosOData.get("/TeamStoreRisks").then((res) => res.data.value);
