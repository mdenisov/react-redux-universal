import webpack from 'webpack';
import config from '../../config';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import cssnext from 'postcss-cssnext';
import postcssFocus from 'postcss-focus';
import postcssReporter from 'postcss-reporter';
import StyleLintPlugin from 'stylelint-webpack-plugin';

const paths = config.get('utils_paths');
const globals = config.get('globals');

const addHash = (template, hash) => {
  if (globals.__PROD__) {
    return template.replace(/\.[^.]+$/, `.[${hash}]$&`);
  }
  return `${template}?hash=[${hash}]`;
};

const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: globals.__PROD__ ? 'source-map' : 'cheap-module-eval-source-map',
  entry: {
    app: [
      'babel-polyfill',
      paths.src('index'),
    ],
  },
  output: {
    path: `${paths.public('client')}`,
    publicPath:
      globals.__HMR__ ?
      config.get('webpack_public_path') :
      `${config.get('project_public_path')}/public/client/`,
    filename: addHash('[name].js', globals.__PROD__ ? 'chunkhash' : 'hash'),
    chunkFilename: addHash('[id].js', 'chunkhash'),
  },
  plugins: [
    new webpack.DefinePlugin(Object.assign(globals, {
      'process.env': {
        NODE_ENV: JSON.stringify(config.get('env')),
      },
      __CLIENT__: true,
      __SERVER__: false,
      __API_PATH__: JSON.stringify(config.get('api_path')),
    })),
    new HtmlWebpackPlugin({
      template: paths.src('index.html'),
      hash: true,
      minify: globals.__PROD__ ? { collapseWhitespace: true } : false,
    }),
    new ExtractTextPlugin(
      addHash('[name].css', 'contenthash'),
      { allChunks: true, disable: globals.__HMR__ }
    ),
    new webpack.ProvidePlugin({
      fetch: 'exports?window.fetch!whatwg-fetch',
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
          ],
          env: {
            development: {
              plugins: [
                'syntax-async-functions',
                'syntax-export-extensions',
                'syntax-jsx',
                'transform-class-properties',
                'transform-export-extensions',
                'transform-react-jsx',
                'transform-regenerator',
                'transform-object-rest-spread',
                // must be an array with options object as second item
                ['react-transform', {
                  // must be an array of objects
                  transforms: [{
                    // you can have many transforms, not just one
                    transform: 'react-transform-catch-errors',
                    imports: ['react', 'redbox-react'],
                  }],
                  // by default we only look for `React.createClass` (and ES6 classes)
                  // but you can tell the plugin to look for different component factories:
                  // factoryMethods: ["React.createClass", "createClass"]
                }],
              ],
            },
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
        loader: ExtractTextPlugin.extract(
            'style',
            `css?modules&importLoaders=1&localIdentName=${globals.__PROD__ ?
              '[hash:base64]' :
              '[name]---[local]---[hash:base64:5]'}!postcss`),
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|eot|woff|woff2)$/,
        loader: 'file?name=[name].[hash].[ext]',
      },
    ],
  },
  postcss: [
    postcssFocus(), // Add a :focus to every :hover
    cssnext({ // Allow future CSS features to be used, also auto-prefixes the CSS...
      browsers: ['last 2 versions', 'IE >= 9'], // ...based on this browser list
    }),
    postcssReporter({ // Posts messages from plugins to the terminal
      clearMessages: true,
    }),
  ],
  eslint: {
    configFile: paths.project('.eslintrc'),
    failOnWarning: globals.__PROD__,
    failOnError: globals.__PROD__,
    emitWarning: true,
    emitError: true,
  },
};

// ----------------------------------
// Environment-Specific Defaults
// ----------------------------------
if (globals.__HMR__) {
  webpackConfig.entry.app.push(
    `webpack-dev-server/client?${config.get('webpack_public_path')}`,
    'webpack/hot/only-dev-server'
  );

  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );

  webpackConfig.module.loaders.forEach(loader => {
    if (loader.loader === 'babel') {
      loader.query.env.development.plugins.forEach((plugin, index) => {
        if (Array.isArray(plugin) && plugin[0] === 'react-transform') {
          loader.query.env.development.plugins[index][1].transforms.push({
            // can be an NPM module name or a local path
            transform: 'react-transform-hmr',
            // see transform docs for "imports" and "locals" dependencies
            imports: ['react'],
            locals: ['module'],
          });
        }
      });
    }
  });
}

if (globals.__PROD__) {
  webpackConfig.plugins = [...webpackConfig.plugins,
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: addHash('vendor.js', globals.__PROD__ ? 'chunkhash' : 'hash'),
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      },
    }),
  ];
  webpackConfig.entry.vendor = config.get('vendor_dependencies');
}

export default webpackConfig;
