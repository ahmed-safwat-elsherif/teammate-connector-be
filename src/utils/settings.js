import fs from 'fs/promises';

export const readSettings = () => {
  return fs
    .readFile('./src/data/settings.json', { encoding: 'utf-8' })
    .then(settings => JSON.parse(settings));
};

export const writeSettings = async settings => {
  try {
    return fs.writeFile('./src/data/settings.json', JSON.stringify(settings));
  } catch (error) {
    return new Error("Couldn't save the new settings");
  }
};
