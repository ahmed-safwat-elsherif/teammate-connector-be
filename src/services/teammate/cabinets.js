import Cabinet from '../../models/cabinet.js';
import axiosTM from '../axios/teammate.js';

export const CABINET_OBJECT_TYPE_ID = 24;

export const createTMCabinet = title =>
  axiosTM.post('/Cabinets', {
    objectTypeId: CABINET_OBJECT_TYPE_ID,
    title,
    author: 'Sync System',
    securityType: null,
    groups: [],
  });

export const getTMCabinet = cabinetId =>
  axiosTM.get(`/Cabinets/${cabinetId}`, {
    params: { objectTypeId: CABINET_OBJECT_TYPE_ID },
  });

export const updateTMCabinet = (id, title) =>
  axiosTM.patch(
    `/Cabinets/${id}`,
    [
      {
        path: '/title',
        op: 'Replace',
        value: title,
      },
    ],
    { params: { objectTypeId: CABINET_OBJECT_TYPE_ID } }
  );

export const removeTMCabinet = id =>
  axiosTM.delete(`/Cabinets/${id}`, {
    params: {
      objectTypeId: CABINET_OBJECT_TYPE_ID,
    },
  });

export const storeCabinet = async (oneSumXId, title) => {
  try {
    const cabinet = await Cabinet.findOne({ where: { oneSumXId } });

    if (cabinet) {
      console.log({ oneSumXId, cabinet });
      const newCabinet = await createTMCabinet(title).then(res => res.data);
      return await Cabinet.create({ id: newCabinet.id, oneSumXId, title });
    }
  } catch (error) {
    throw new Error(`Couldn't store cabinet of info: id=${id}, oneSumXId = ${oneSumXId}`);
  }
};

export const removeCabinet = async id => {
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
