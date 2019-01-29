const { isProd, modifyWebpackConfig } = require('@gera2ld/plaid/util');

module.exports = modifyWebpackConfig(async (config) => {
  config.devServer.port = 3000;
  config.externals = {
    ...config.externals,
    electron: 'require("electron")',
  };
  return config;
});
