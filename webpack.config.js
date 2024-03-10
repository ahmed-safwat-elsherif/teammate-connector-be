import path from 'node:path';
import nodeExternals from 'webpack-node-externals';
import { __dirname } from './filePath.js';

/** @type {Config} */
const config = {
  mode: 'production',
  entry: ['./index.js', './package.json'],
  target: 'node',
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
};

export default config;
