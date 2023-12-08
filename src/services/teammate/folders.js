import axiosOData from "../axios/teammateOData.js";
import structureTMFolders from "../../utils/structureTMFolders.js";
import axiosTM from "../axios/teammate.js";
import { CABINET_OBJECT_TYPE_ID } from "./cabinets.js";

const RISK_FOLDER_OBJECT_TYPE_ID = 24;
const CONTROL_FOLDER_OBJECT_TYPE_ID = 25;
const FOLDER_PARENT_OBJECT_TYPE_ID = 22;

export const getTeammateFolders = () =>
  axiosOData
    .get("/Folders")
    .then((res) => structureTMFolders(res.data.value, null));

export const createFolder = ({
  title,
  parentId,
  onSumId,
  parentIsFolder = true,
  folderType,
}) =>
  axiosTM.post("/Folder", {
    objectTypeId:
      folderType === "RISK"
        ? RISK_FOLDER_OBJECT_TYPE_ID
        : CONTROL_FOLDER_OBJECT_TYPE_ID,
    title,
    parentId,
    parentTypeId: parentIsFolder
      ? FOLDER_PARENT_OBJECT_TYPE_ID
      : CABINET_OBJECT_TYPE_ID,
  });
