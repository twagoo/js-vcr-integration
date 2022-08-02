const {merge} = require('webpack-merge');
const JsDocPlugin = require('jsdoc-webpack-plugin');
const baseConfig = require('./webpack.config.js');

/**
 * Webpack configuration for PRODUCTION
 * 
 * Builds on webpack.config.js
 */
module.exports = merge(baseConfig, {
    plugins: [
        // Calls jsdoc to generate documentation. See jsdoc.conf.js
        new JsDocPlugin({
            conf: 'jsdoc.conf.js',
            cwd: '.',
            preserveTmpFile: false,
            recursive: false
        })
    ]
});
