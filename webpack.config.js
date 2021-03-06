var path = require('path');
var webpack = require('webpack');
var packageData = require('./package.json');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var minify = process.argv.indexOf('--minify') !== -1;
var filename = [packageData.name, packageData.version, 'js'];
var cssfilename = [packageData.name, packageData.version, 'css'];
var plugins = [], lessPlugins = [];
if (minify) {
    filename.splice(filename.length - 1, 0, 'min');
    plugins.push(new webpack.optimize.UglifyJsPlugin());
    cssfilename.splice(cssfilename.length - 1, 0, 'min');
    lessPlugins.push(new LessPluginCleanCSS({advanced: true}));
}
module.exports = [
  {
    entry: {
      app: packageData.main,
      vendor: ['angular']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: filename.join('.')
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel'
        },
      ]
    },
    devtool: 'source-map',
    plugins: [
      new webpack.optimize.CommonsChunkPlugin(
        'vendor', 'bundle.js')
    ]
  },
  {
    entry: {
      app: packageData.html
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: filename.join('.')
    },
    module: {
      loaders: [
        {
          test: /\.(html)$/,
          loader: 'file-loader?name=[name].[ext]!extract-loader!html-loader'
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'file-loader?name=[name].[ext]'
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
      new CopyWebpackPlugin([
        {
          from: packageData.ico, to: './'
        }
      ])
    ]
  },
  {
    entry: {
      app: packageData.css
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: cssfilename.join('.')
    },
    module: {
      loaders: [
        {
          test: /\.(jpg)$/,
          loader: 'file-loader?name=[name].[ext]'
        },
        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract("style-loader?",
          "css-loader?sourceMap!less-loader?sourceMap")
        }
      ]
    },
    lessLoader: {
      lessPlugins: lessPlugins
    },
    devtool: 'source-map',
    plugins: [
        new ExtractTextPlugin(cssfilename.join('.'))
    ]
  },
  {
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.html'
    },
    module: {
      loaders: [
        {
          test: /\.ejs$/,
          loader: 'ejs-loader'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        version: packageData.version,
        template: packageData.mainHtml
      })
    ]
  }
]
