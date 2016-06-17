import webpack from 'webpack';
import config from '../../config';
import fs from 'fs';
import StyleLintPlugin from 'stylelint-webpack-plugin';

const paths = config.get('utils_paths');
const globals = config.get('globals');

const webpackConfig = {
  name: 'server',
  target: 'node',
  entry: {
    app: [
      paths.server('app'),
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
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: paths.src(),
      files: '**/*.css',
      failOnError: globals.__PROD__,
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
          cacheDirectory: globals.__PROD__,
          presets: ['es2015'],
          plugins: [
            'syntax-async-functions',
            'syntax-export-extensions',
            'syntax-jsx',
            'transform-class-properties',
            'transform-export-extensions',
            'transform-react-jsx',
            'transform-regenerator',
            'transform-object-rest-spread',
            ['transform-runtime', {
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
        loader: `classes!css?modules&localIdentName=${globals.__PROD__ ?
          '[hash:base64]' :
          '[name]---[local]---[hash:base64:5]'}`,
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

if (globals.__DEV__) {
  config.get('vendor_dependencies').forEach(dep => {
    webpackConfig.plugins.push(new webpack.PrefetchPlugin(dep));
  });
}

export default webpackConfig;
