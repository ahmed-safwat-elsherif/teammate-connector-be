import path from 'node:path';
import nodeExternals from 'webpack-node-externals';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { getURLDirname } from './filePath.js';

export default {
  entry: './index.js',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'main.js',
    path: path.resolve(getURLDirname(), 'build'),
    chunkFormat: 'module',
  },
  target: 'node',
  mode: 'production',
  externalsType: 'module',
  externals: [
    nodeExternals({
      importType: 'module',
    }),
  ],
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './package.json', to: 'package.json' },
        { from: './src/data', to: 'src/data' },
        { from: './src/syncLogs', to: 'src/syncLogs' },
      ],
    }),
  ],
};
