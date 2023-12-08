import getOneSumXData from "../services/oneSumX/getOneSumXData.js";
import { storeCabinet } from "../services/teammate/cabinets.js";

export default async () => {
  const oneSumData = await getOneSumXData();
  const cabinets = Object.entries(oneSumData).map(([cabinetId, cabinet]) => ({
    cabinet,
    cabinetId,
  }));
  console.log({ onSumCabinet: cabinets });
  await Promise.all(
    cabinets.map((item) =>
      storeCabinet(item.cabinet.cabinetId, item.cabinet.cabinetName)
    )
  );
};
