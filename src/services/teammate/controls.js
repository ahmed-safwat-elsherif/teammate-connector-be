import axiosTM from "../axios/teammate.js";

export const getTMControl = (controlId) =>
  axiosTM.get(`/Controls/${controlId}`);

export const createTMControl = (title, parentFolderId) =>
  axiosTM.post("/Controls", {
    parentFolderId,
    title,
  });

export const removeTMControl = (controlId) =>
  axiosTM.delete(`/Controls/${controlId}`);

export const updateTMControl = (controlId, title) =>
  axiosTM.patch(`/Controls/${controlId}`, [
    {
      path: "/title",
      op: "Replace",
      value: title,
    },
  ]);
