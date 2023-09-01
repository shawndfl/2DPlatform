const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: { import: './src/index.ts' },
  },
  mode: 'development',
  resolve: { extensions: ['.ts', '.js'] },
  plugins: [
    new HtmlWebpackPlugin({
      title: '2D Platform',
      template: path.resolve(__dirname, 'src/index.html'),
      publicPath: '.',
      chunks: ['main'],
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'static'), to: path.resolve(__dirname, 'docs') }
      ],
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
