const path = require('path');

module.exports = {
    entry: {
        "itowns-ros": [path.resolve(__dirname, 'src/MainBundle.js')],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
//      library: 'itowns-ros',
//      umdNamedDefine: true,
        libraryTarget: 'umd',
        filename: '[name].js'
    },
};
