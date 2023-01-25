const os = require('os');
const path = require('path');
const slsw = require('serverless-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

/** 
 * VAR DECLARATION
 * insert here all the common variables to be used in both environments
 * 
*/
var customMinimizer  = [];
var customPlugins    = [];
var customRules      = [];
var customExternals  = [];
var externalsOptions = {};
var chunkOptions     = false;

customPlugins.push(new FilterWarningsPlugin({
  exclude: [
    /mongodb/, 
    /mssql/, 
    /mysql2/, 
    /oracledb/, 
    /pg/, 
    /pg-native/, 
    /pg-query-stream/, 
    /redis/, 
    /sqlite3/,
    /sql/,
    /react-native-sqlite-storage/
  ]
}));

customRules.push({
  test: /\.tsx?$/,
  exclude: [/node_modules/],
  loader: 'ts-loader',
  options:{
    transpileOnly:true,
    experimentalWatchApi:true
  }
});

customRules.push({
  test: /\.xml/,
  use: [
    {
      loader: 'file-loader',
    },
  ]
});

/**
 * EXCLUSIVE CONFIGURATION
 * insert in here those configurations specified for certain environments
 */
if (slsw.lib.webpack.isLocal){
  customRules.unshift({loader: 'cache-loader'});
  externalsOptions.whitelist = "typeorm";
}else{
  
  customPlugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"'
  }));

  if(Object.keys(slsw.lib.entries).length > 5){

    chunkOptions = {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -10,
          minSize: 0
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          minSize: 0
        }
      }
    }

    customPlugins.push(new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }));

  }

  customExternals.push(/aws-sdk/,/aws-lambda/);
  customMinimizer.push(new TerserPlugin({
    parallel: false, //at max only 4 threads are allowed to run in paralel, these threads are only for terser usage
    cache:false, // disable cache on production builds, to everytime get a fresh build as output
    terserOptions: {
      keep_fnames:true,
      keep_classnames: true,
      output : {
        beautify: false // no beautify code, keep it minimized
      },
      compress: false,
      warnings: false, // no warning from webpack during output
      mangle: false, //  mangling code is problably one of the few reasons that can cause an error due to comunication between typeorm and mysql node libraries
      module: false, // only enabled for es6 modules build, in this case is not required
      nameCache: {} //cache is disabled, nameCache is not required and only needs to be used if the cache is enabled to define an strategy of name convention
    }
  }));
}

/**
 * WEBPACK CONFIGURATION
 * webpack object construction, put in here static configurations for both environments
 * 
 */
module.exports = {
  devtool: false,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  resolve: {
    symlinks: false, // symlinks aren't required, currently lerna bootstrap is not being used 
    extensions: ['.js', '.json', '.ts'],
    cacheWithContext: false, // cache is disabled on all levels
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ]
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: chunkOptions,
    minimize: slsw.lib.webpack.isLocal ? false : true,
    minimizer : customMinimizer
  },
  output: {
    pathinfo: false,
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  plugins:customPlugins,
  target: 'node',
  externals: [nodeExternals(externalsOptions),...customExternals], //exclude non required dependencies
  module: {
    exprContextCritical: false,
    rules: customRules
  }
};