import fsPromises from 'node:fs/promises';

export default async filePath => {
  try {
    const file = await fsPromises.open(filePath);
    file.close();
    return true; // File exists
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // File does not exist
    } else {
      throw error; // Other error
    }
  }
};
