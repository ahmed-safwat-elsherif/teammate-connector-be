import { dirname } from 'node:path';
import * as url from 'node:url';

export const getURLFilename = () => url.fileURLToPath(import.meta.url);
export const getURLDirname = () => dirname(getURLFilename());
