const path = require('path');


module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'main.js', 
      path: path.resolve(__dirname, 'dist'),
    },

    module: {
        rules: [
            {
                test: /\.wasm$/,
                type: 'javascript/auto',
            },
            {
                test: /\.css$/i, 
                use: ['style-loader', 'css-loader'], 
            }, 
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i, 
                type: 'asset/resource', 
            }, 
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            }

        ], 
    }, 

    devServer: {

        static: {
            directory: path.join(__dirname, 'dist'),
          },
          compress: true,
          port: 9000,






    },


    mode: 'development'
  };