import axiosBase from "axios";
import { oDataBaseUrl, tmPassword, tmUsername } from "../../config/index.js";

const axiosOData = axiosBase.create({
  baseURL: oDataBaseUrl,
  headers: {
    Authorization:
      "Basic " + Buffer.from(tmUsername + ":" + tmPassword).toString("base64"),
  },
});
export default axiosOData;
