import axiosOData from "../axios/teammateOData.js";
import structureTMFolders from "../../utils/structureTMFolders.js";
import axiosTM from "../axios/teammate.js";

const RISK_FOLDER_OBJECT_TYPE_ID = 24;
const CONTROL_FOLDER_OBJECT_TYPE_ID = 25;
const FOLDER_PARENT_OBJECT_TYPE_ID = 22;
const CABINET_OBJECT_TYPE_ID = 52;

export const FOLDER_TYPE_RISK = "RISK";
export const FOLDER_TYPE_CONTROL = "CONTROL";

export const getTeammateFolders = () =>
  axiosOData
    .get("/Folders")
    .then((res) => structureTMFolders(res.data.value, null));

export const createTMFolder = ({
  title,
  parentId,
  parentIsFolder = true,
  folderType = FOLDER_TYPE_RISK,
}) => {
  const body = {
    objectTypeId:
      folderType === FOLDER_TYPE_RISK
        ? RISK_FOLDER_OBJECT_TYPE_ID
        : CONTROL_FOLDER_OBJECT_TYPE_ID,
    title,
    parentId,
    parentTypeId: parentIsFolder
      ? FOLDER_PARENT_OBJECT_TYPE_ID
      : CABINET_OBJECT_TYPE_ID,
  };
  return axiosTM.post("/Folders", body);
};

export const getTMFolder = (folderId, folderType = FOLDER_TYPE_RISK) =>
  axiosTM.get(`/Folders/${folderId}`, {
    params: {
      objectTypeId:
        folderType === FOLDER_TYPE_RISK
          ? RISK_FOLDER_OBJECT_TYPE_ID
          : CONTROL_FOLDER_OBJECT_TYPE_ID,
    },
  });

export const updateTMFolder = (id, title, folderType = FOLDER_TYPE_RISK) =>
  axiosTM.patch(
    `/Folders/${id}`,
    [
      {
        path: "/title",
        op: "Replace",
        value: title,
      },
    ],
    {
      params: {
        objectTypeId:
          folderType === FOLDER_TYPE_RISK
            ? RISK_FOLDER_OBJECT_TYPE_ID
            : CONTROL_FOLDER_OBJECT_TYPE_ID,
      },
    }
  );

export const removeTMFolder = (id, folderType = FOLDER_TYPE_RISK) =>
  axiosTM.delete(`/Folders/${id}`, {
    params: {
      objectTypeId:
        folderType === FOLDER_TYPE_RISK
          ? RISK_FOLDER_OBJECT_TYPE_ID
          : CONTROL_FOLDER_OBJECT_TYPE_ID,
    },
  });
