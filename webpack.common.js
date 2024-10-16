/* eslint-disable import/no-extraneous-dependencies */
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: {
    index: './src/index.ts',
    // login: './src/login.ts',
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(css)$/,
        use: [
          // MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  target: ['web'],
  watchOptions: {
    poll: true,
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    // }),
    new CopyPlugin({
      patterns: [
        { from: '*.html', context: 'src/view/' },
        { from: '*.css', context: 'src/view/' },
        { from: '*.*', context: 'src/assets/' },
        // { from: '*.png', context: 'src/images/' },
      ],
    }),
    new ESLintPlugin({
      extensions: ['.ts', '.js'],
      exclude: 'node_modules',
    }),
    new CleanWebpackPlugin(),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
  ],
};
