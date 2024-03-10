import * as url from 'url';
import path from 'path';

export const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const __filename = url.fileURLToPath(import.meta.url);
