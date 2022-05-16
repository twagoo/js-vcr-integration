const path = require('path');

module.exports = {
   entry: {
      app: './src/main.js'
   },
   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'vcr-integration.js'
   },
   mode:'development',
   module: {
      rules: [
         {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            loader: 'babel-loader',
            options: {
               "presets": ["@babel/preset-env"]
            }
         }
      ]
   }
};
