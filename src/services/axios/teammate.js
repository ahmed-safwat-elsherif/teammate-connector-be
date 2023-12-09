import axiosBase from "axios";
import { teammateAuthToken, tmBaseUrl } from "../../config/index.js";

const axiosTM = axiosBase.create({
  baseURL: tmBaseUrl,
  headers: {
    Authorization: teammateAuthToken,
  },
});

export default axiosTM;