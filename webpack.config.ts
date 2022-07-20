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
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library:'BananaGL',
    libraryTarget: 'window',
  },
  ...common
};

const configLoader: Configuration = {
  entry: {
    loaderWorker: './src/loaderWorker.ts'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library:'BananaGLLoader',
    libraryTarget: 'umd'
  },
  ...common
};

const configStyler: Configuration = {
  entry: {
    styleWorker: './src/styleWorker.ts'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library:'BananaGLStyler',
    libraryTarget: 'umd'
  },
  ...common
};

export default [configMain, configLoader, configStyler];