const { modifyWebpackConfig } = require('@gera2ld/plaid/util');

module.exports = modifyWebpackConfig(async (config) => {
  config.externals = {
    ...config.externals,
    electron: 'require("electron")',
  };
  config.devServer.port = 3000;
  return config;
});
