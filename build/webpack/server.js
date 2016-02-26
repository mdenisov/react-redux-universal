import webpack from 'webpack';
import config from '../../config';
import fs from 'fs';

const paths = config.get('utils_paths');
const globals = config.get('globals');

const webpackConfig = {
  name: 'server',
  target: 'node',
  entry: {
    app: [
      paths.src('entry-points/server'),
    ],
  },
  externals: fs.readdirSync('node_modules').filter(module => module !== '.bin'),
  output: {
    path: paths.dist('server'),
    libraryTarget: 'commonjs2',
    filename: 'index.js',
  },
  plugins: [
    new webpack.DefinePlugin(Object.assign(globals, {
      __SERVER__: true,
      __CLIENT__: false,
      __API_PATH__: JSON.stringify(config.get('api_path')),
    })),
    new webpack.ProvidePlugin({
      fetch: 'node-fetch',
      regeneratorRuntime: 'imports?regeneratorRuntime=>undefined!regenerator/runtime',
    }),
  ],
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
        include: paths.project(config.get('dir_src')),
      },
    ],
    loaders: [
      {
        test: /\.js$/,
        include: paths.project(config.get('dir_src')),
        loader: 'babel',
        query: {
          cacheDirectory: globals.__PROD__ ? true : false,
          presets: ['es2015'],
          plugins: [
            'syntax-async-functions',
            'syntax-export-extensions',
            'syntax-jsx',
            'transform-class-properties',
            'transform-export-extensions',
            'transform-react-jsx',
            'transform-regenerator',
          ],
        },
      },
      {
        test: /\.css$/,
        loader: `classes!css?modules&localIdentName=${globals.__PROD__ ? '[hash:base64]' : '[name]---[local]---[hash:base64:5]'}`,
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|eot|woff|woff2)$/,
        loader: 'file?name=[name].[hash].[ext]',
      },
    ],
  },
  eslint: {
    configFile: paths.project('.eslintrc'),
    failOnWarning: globals.__PROD__,
    failOnError: globals.__PROD__,
    emitWarning: true,
    emitError: true,
  },
};

if (globals.__PROD__) {
  webpackConfig.plugins = [...webpackConfig.plugins,
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
  ];
}

export default webpackConfig;
