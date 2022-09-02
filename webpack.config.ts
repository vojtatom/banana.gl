import path from "path";
import { Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const common = {
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false
    }),
  ],
  //watch: true
}

const configMain: Configuration = {
  entry: {
    bananagl: "./src/bananagl.ts"
  },
  output: {
    path: path.resolve(__dirname, "examples/dist"),
    filename: "[name].js",
    library:'BananaGL',
    libraryTarget: 'window',
  },
  ...common
};

const configMTCTW: Configuration = {
  entry: {
    metacityWorker: './src/workers/metacity/worker.ts'
  },
  output: {
    path: path.resolve(__dirname, "examples/dist"),
    filename: "[name].js",
    library:'MetacityWorker',
    libraryTarget: 'umd'
  },
  ...common
};

export default [configMain, configMTCTW];