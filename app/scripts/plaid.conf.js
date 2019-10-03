/**
 * For each entry, `key` is the chunk name,
 * `value.entry` is the webpack entry,
 * `value.html` is the options object passed to HtmlWebpackPlugin.
 */

exports.pages = {
  index: {
    entry: './src/index',
    html: {
      title: 'WallPainter',
    },
  },
  loader: {
    entry: './src/loader',
    html: {
      title: 'Loading...',
    },
  },
};

exports.global = {
  devServer: {
    port: 3000,
  },
};
