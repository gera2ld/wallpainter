const baseConfigProvider = require('webpack-util/config/webpack.base.conf');
const webpackUtil = require('webpack-util/webpack');
const { parseConfig } = require('webpack-util/util');
const pages = require('./pages.conf');

module.exports = async () => {
  const config = await parseConfig(baseConfigProvider);
  config.externals = {
    ...config.externals,
    electron: 'require("electron")',
  };
  config.devServer.port = 3000;
  return webpackUtil.html({ pages })(config);
};
