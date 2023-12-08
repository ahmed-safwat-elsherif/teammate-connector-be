import Cabinet from "../../models/cabinet.js";
import axiosTM from "../axios/teammate.js";

const MAX_CABINET_COUNT = 1000;
const BATCH_COUNT = 50;
export const CABINET_OBJECT_TYPE_ID = 24;

const getTMCabinetsCount = () =>
  axiosTM
    .get("/Cabinets", { params: { objectTypeId: 24, metadataOnly: true } })
    .then((res) => res.data.metadata.totalCount);

const getTMCabinetsPaginated = (page, pageSize = BATCH_COUNT) =>
  axiosTM.get("/Cabinets", {
    params: {
      objectTypeId: 24,
      "paging.pageNumber": page,
      "paging.pageSize": pageSize,
    },
  });

export const getTMCabinets = async () => {
  const totalCount = await getTMCabinetsCount();

  const numOfBatches = Math.ceil(
    (totalCount < MAX_CABINET_COUNT ? totalCount : MAX_CABINET_COUNT) /
      BATCH_COUNT
  );

  const data = await Promise.all(
    Array.from(Array(numOfBatches)).map((_, index) =>
      getTMCabinetsPaginated(index + 1).then((res) => res.data.results)
    )
  )
    .then((res) => res.flat())
    .catch(() => []);
  return data;
};

export const createTMCabinet = (title) =>
  axiosTM.post("/Cabinets", {
    objectTypeId: CABINET_OBJECT_TYPE_ID,
    title,
    author: "Sync System",
    securityType: null,
    groups: [],
  });

export const storeCabinet = async (oneSumXId, title) => {
  try {
    const cabinet = await createTMCabinet(title);
    console.log({ oneSumXId, cabinet });
    return await Cabinet.create({ id: cabinet.id, oneSumXId, title });
  } catch (error) {
    console.dir(error);
    throw new Error(
      `Couldn't store cabinet of info: id=${id}, oneSumXId = ${oneSumXId}`
    );
  }
};

export const removeCabinet = async (id) => {
  try {
    const cabinet = await Cabinet.destroy({
      where: {
        id,
      },
    });
    return cabinet;
  } catch (error) {
    throw new Error(`Couldn't store cabinet of id ${id}`);
  }
};
