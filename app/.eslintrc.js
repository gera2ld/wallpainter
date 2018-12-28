module.exports = {
  root: true,
  extends: [
    require.resolve('webpack-util/eslint'),
    require.resolve('webpack-util-vue/eslint/vue'),
  ],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  rules: {
  },
};
