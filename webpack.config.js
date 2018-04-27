const path = require('path');

module.exports = {
    entry: {
        "itowns-ros": [path.resolve(__dirname, 'src/main.js')],
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].js',
        library: 'itownsRos',
        libraryTarget: 'umd'
    },
  devServer: {
    publicPath: '/dist/'
  },
};
