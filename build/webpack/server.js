import webpack from 'webpack';
import fs from 'fs';
import StyleLintPlugin from 'stylelint-webpack-plugin';
import config from '../../config';
import findCacheDir from 'find-cache-dir'; // eslint-disable-line

const paths = config.get('utils_paths');
const globals = config.get('globals');

const removeEmpty = (obj) => obj.filter(el => !!el);
const ifProd = (el = true, defEl) => (globals.__PROD__ ? el : defEl);

const webpackConfig = {
  name: 'server',
  target: 'node',
  bail: !!ifProd(),
  entry: {
    app: paths.server('app'),
  },
  externals: fs.readdirSync('node_modules').filter(module => module !== '.bin'),
  output: {
    path: paths.dist('server'),
    libraryTarget: 'commonjs2',
    filename: 'index.js',
    pathinfo: true,
  },
  plugins: removeEmpty([
    new webpack.DefinePlugin(Object.assign(globals, {
      __SERVER__: true,
      __CLIENT__: false,
      __API_PATH__: JSON.stringify(config.get('api_path')),
    })),
    new webpack.ProvidePlugin({
      fetch: 'node-fetch',
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: paths.src(),
      files: '**/*.css',
      failOnError: !!ifProd(),
    }),
    ifProd(new webpack.NoErrorsPlugin()),
    ifProd(new webpack.optimize.OccurrenceOrderPlugin()),
    ifProd(new webpack.optimize.DedupePlugin()),
  ]),
  resolve: {
    extensions: ['', '.js'],
  },
  resolveLoader: {
    modulesDirectories: [
      'node_modules',
      'build/webpack/loaders',
    ],
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: [
          paths.project(config.get('dir_src')),
          paths.project(config.get('dir_server')),
        ],
      },
    ],
    loaders: [
      {
        test: /\.js$/,
        include: [
          paths.project(config.get('dir_src')),
          paths.project(config.get('dir_server')),
        ],
        loader: 'babel',
        query: {
          cacheDirectory: ifProd(false, findCacheDir({ name: 'server-bundle' })),
          presets: ['es2015', 'es2016', 'react'],
          plugins: [
            'syntax-async-functions',
            'syntax-export-extensions',
            'transform-class-properties',
            'transform-export-extensions',
            'transform-regenerator',
            'transform-object-rest-spread',
            'syntax-trailing-function-commas',
            ['transform-runtime', {
              helpers: false,
              polyfill: false,
              regenerator: true,
            }],
          ],
          env: {
            production: {
              plugins: [
                'transform-react-remove-prop-types',
                'transform-react-constant-elements',
              ],
            },
          },
        },
      },
      {
        test: /\.css$/,
        loader: `classes!css?modules&localIdentName=${ifProd(
          '[hash:base64]',
          '[name]---[local]---[hash:base64:5]')}`,
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|eot|woff|woff2)$/,
        loader: 'file?name=[name].[hash].[ext]',
      },
    ],
  },
  eslint: {
    configFile: paths.project('.eslintrc'),
    failOnWarning: !!ifProd(),
    failOnError: !!ifProd(),
    emitWarning: true,
    emitError: true,
  },
};

export default webpackConfig;
