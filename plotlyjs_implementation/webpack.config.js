var webpack = require('webpack');

module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  node: { 
    fs: 'empty'
  },
  module: {
    rules: [
      process.env.NODE_ENV === 'production' ? { test: /\.js$/, use: 'babel-loader' } : {},
      {
        test: /\.js$/,
        use: [
          'ify-loader',
          'transform-loader?plotly.js/tasks/compress_attributes.js',
          ]
      },
    ]
  },
};
