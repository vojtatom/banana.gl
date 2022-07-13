import path from "path";
import { Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const config: Configuration = {
  entry: {
    bananagl: "./src/index.ts",
    worker: './src/loaderWorker.ts'
  },
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
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: 'libpack',
    libraryTarget:'umd'
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false
    }),
  ],
  watch: true
};
export default config;