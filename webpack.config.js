var webpack = require("webpack");
var join = require('path').join;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');
var argv = require('yargs').argv;
var env = argv.env || 'local';

function getHtmlVariables(options) {
  return Object.assign({
    getAssets: function(asset) {
      return asset;
    },
    favicon: 'favicon.ico',
    inject: false, // disable scripts and links auto injecting
    template: 'index.ejs', // index template
    filename: 'index.html', // destination filename
    base: '/',
  });
}

function getDevtool() {
  return env === 'local' ? 'eval' : 'source-map';
}

function getPathInfo() {
  return env === 'local';
}

function isDebug() {
  return env === 'local';
}

function getPlugins() {
  var basePlugins = [
    new webpack.OldWatchingPlugin(),
    new ExtractTextPlugin('styles_[hash].css', {
      allChunks: true
    }),
    new HtmlWebpackPlugin(
      getHtmlVariables({})
    ),
    new webpack.optimize.OccurenceOrderPlugin()
  ];

  if (env !== 'local') {
    basePlugins = basePlugins.concat([
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        mangle: true
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify("production")
        }
      })
    ]);
  }
  return basePlugins;
}

module.exports = {
  context: join(__dirname, 'src'),
  entry: {
    'bundle': [
      'babel-polyfill',
      'favicon.ico',
      './styles/main.less',
      './scripts/main.js'
    ]
  },

  postcss: [
      autoprefixer({
        browsers: 'last 2 versions'
      })
    ],

  resolve: {
    root: join(__dirname, 'src'),
    extensions: ['', '.js', '.json', '.less', '.css'],
    modulesDirectories: [
      'node_modules',
      join(__dirname, 'src/scripts')
    ],
    alias: {}
  },
  module: {
    loaders: [{
      test: /.*\.(gif|png|jpe?g|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=assets/images/[name].[ext]',
        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
      ]
      }, {
      test: /.*\.(ico)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[name].[ext]',
        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }, {
      test: /(\.js)$/,
      include: [
        join(__dirname, 'src/scripts')
      ],
      loader: 'babel-loader?cacheDirectory'
      }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract('style', [
        'css-loader?sourceMap',
        'postcss',
        'less-loader?sourceMap'
      ])
      }, {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'file?name=[name].[ext]'
      }]
  },
  plugins: getPlugins(),

  debug: isDebug(),
  devtool: getDevtool(),

  devServer: {
    historyApiFallback: true,
    contentBase: './dest',
    host: '0.0.0.0',
    port: 9001,
    quiet: true,
    noInfo: true
  },

  output: {
    path: join(__dirname, '/dest'),
    filename: '[name]_[hash].js',
    pathinfo: getPathInfo()
  }
};
