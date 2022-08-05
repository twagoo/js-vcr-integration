const path = require('path');
const babelConfig = require('./babel.config.js');
const handlebarsConfig = require('./handlebars.config.js');

/**
 * Webpack BASE configuration
 * 
 */
module.exports = {
    mode: 'production',
    entry: {
        app: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vcr-integration.js'
    },
    optimization: {
        usedExports: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'babel-loader',
                options: babelConfig
            }, {
                // Handlebars for templating. See https://handlebarsjs.com
                test: /\.handlebars$/,
                loader: "handlebars-loader",
                // Loading of custom helpers. See https://stackoverflow.com/a/48668117 
                options: handlebarsConfig,
            }, {
                test: /\.(css|scss)$/i,
                include: path.resolve(__dirname, 'src/style'),
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader"},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                    {loader: 'encapsulated-css-loader', options: {className: 'vcr-plugin'}}
                ],
            }
        ]
    }
};
