const webpackUtil = require('webpack-util/webpack');
const { isProd, defaultOptions, combineConfig } = require('webpack-util/util');

// defaultOptions.hashedFilename = isProd;

const baseConfig = combineConfig({
  externals: {
    electron: 'require("electron")',
  },
  devServer: {
    port: 3000,
  },
}, [
  webpackUtil.common(),
  webpackUtil.css(),
  webpackUtil.url(),
  webpackUtil.raw(),
  webpackUtil.svg(),
  // webpackUtil.devServer(),
  // webpackUtil.sw(),
  process.env.RUN_ENV === 'analyze' && webpackUtil.analyze(),
  webpackUtil.vue(),
]);

module.exports = baseConfig;
