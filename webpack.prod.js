const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    debug: './src/utilities/webgl-debug.js',
    main: { import: './src/index.ts', dependOn: 'debug' },
  },
  mode: 'development',
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Earth Quest',
      template: path.resolve(__dirname, 'src/index.html'),
      chunks: ['debug', 'main'],
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './docs'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.mp3$/,
        use: ["url-loader"]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
    ],
  },
};
