const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

const pkg = require('./package.json');
const babelConfig = require('./babel.config.js');
const handlebarsConfig = require('./handlebars.config.js');

/**
 * Webpack BASE configuration
 * 
 */

 const banner = `Virtual Collection Registry integration plugin v${pkg.version}
 Licensed GPLv3. CLARIN ERIC - https://www.clarin.eu`;

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
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                    { loader: 'encapsulated-css-loader', options: { className: 'vcr-plugin' } }
                ],
            }
        ]
    },
    optimization: {
        //minimize: production,
        minimizer: [
            new TerserPlugin({
                parallel: require('os').cpus().length,
                terserOptions: {
                    ie8: false,
                    keep_fnames: false,
                    output: {
                        beautify: false,
                        comments: (node, { value, type }) =>
                            type == 'comment2' && value.startsWith('!'),
                    },
                },
            }),
        ],
    },
    plugins: [new webpack.BannerPlugin({ banner })]
};
