import axiosBase from 'axios';
import { teammateAuthToken, tmBaseUrl } from '../../config/index.js';

const axiosTM = axiosBase.create({
  baseURL: tmBaseUrl,
  headers: {
    Authorization: teammateAuthToken,
  },
  timeout: 60_000,
});

export default axiosTM;
