// @flow

import webpack from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import FlowWebpackPlugin from 'flow-webpack-plugin'

const PRODUCTION = process.env.NODE_ENV === 'production'
const SRC_DIR = path.join(__dirname, 'src')
const BUILD_DIR = path.join(__dirname, 'build')

// Plugins in production and development
const commonPlugins = [
  new webpack.NamedModulesPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  new webpack.NoEmitOnErrorsPlugin(),
  new FlowWebpackPlugin({
    failOnError: true,
    flowPath: path.join(__dirname, 'node_modules', '.bin', 'flow'),
  }),
  new HtmlWebpackPlugin({
    template: 'index.html',
    minify: {
      collapseWhitespace: true,
      removeComments: true,
    },
  }),
]

const productionPlugins = [
  new webpack.optimize.UglifyJsPlugin(),
]

const devPlugins = [
  new webpack.HotModuleReplacementPlugin(),
]

const plugins = PRODUCTION
  ? commonPlugins.concat(productionPlugins)
  : commonPlugins.concat(devPlugins)

export default {
  watch: !PRODUCTION,
  context: SRC_DIR,
  output: {
    filename: '[hash].js',
    path: BUILD_DIR,
    publicPath: '/',
  },
  entry: [
    ...PRODUCTION ? [] : [
      'react-hot-loader/patch',
    ],
    './main.js',
  ],
  module: {
    rules: [
      // Linting
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              // Force no lint errors on production
              failOnWarning: PRODUCTION,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        loaders: [ 'react-hot-loader/webpack', 'babel-loader' ],
        include: [
          /src\/.*/,
        ],
      },
      {
        test: /\.styl$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
      },
    ],
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  stats: {
    chunks: false,
  },
}
