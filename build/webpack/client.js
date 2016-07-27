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

const removeEmpty = (obj) => {
  if (Array.isArray(obj)) {
    return obj.filter(el => !!el);
  }
  const result = {};
  Object.keys(obj).forEach(key => {
    if (key !== 'undefined') {
      result[key] = obj[key];
    }
  });
  return result;
};
const ifHot = (el = true, defEl) => (globals.__HMR__ ? el : defEl);
const ifProd = (el = true, defEl) => (globals.__PROD__ ? el : defEl);

const addHash = (template, hash) =>
  ifProd(template.replace(/\.[^.]+$/, `.[${hash}]$&`),
    ifHot(template, `${template}?hash=[${hash}]`));

const webpackConfig = {
  name: 'client',
  target: 'web',
  bail: !!ifProd(),
  devtool: ifProd('source-map', 'cheap-module-eval-source-map'),
  entry: {
    app: removeEmpty([
      'babel-polyfill',
      paths.src('index'),
      ifHot(`webpack-dev-server/client?${config.get('webpack_public_path')}`),
      ifHot('webpack/hot/only-dev-server'),
    ]),
    vendor: config.get('vendor_dependencies'),
  },
  output: {
    path: `${paths.public('client')}`,
    publicPath: ifHot(config.get('webpack_public_path'),
      `${config.get('project_public_path')}/public/client/`),
    filename: addHash('[name].js', 'chunkhash'),
    chunkFilename: addHash('[id].js', 'chunkhash'),
    pathinfo: !ifProd(),
  },
  plugins: removeEmpty([
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
      minify: ifProd({
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      }, false),
    }),
    new ExtractTextPlugin(
      addHash('[name].css', 'contenthash'),
      { allChunks: true, disable: !!ifHot() }
    ),
    new webpack.ProvidePlugin({
      fetch: 'exports?window.fetch!whatwg-fetch',
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: paths.src(),
      files: '**/*.css',
      failOnError: !!ifProd(),
    }),
    ifHot(new webpack.HotModuleReplacementPlugin()),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: addHash('vendor.js', 'chunkhash'),
    }),
    ifProd(new webpack.NoErrorsPlugin()),
    ifProd(new webpack.optimize.OccurrenceOrderPlugin(true)),
    ifProd(new webpack.optimize.DedupePlugin()),
    ifProd(new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      },
    })),
  ]),
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
          cacheDirectory: !!ifProd(),
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
            'transform-flow-strip-types',
            'transform-exponentiation-operator',
            'syntax-trailing-function-commas',
          ],
          env: {
            development: {
              plugins: [
                ['react-transform', {
                  transforms: removeEmpty([
                    ifHot({
                      transform: 'react-transform-hmr',
                      // see transform docs for "imports" and "locals" dependencies
                      imports: ['react'],
                      locals: ['module'],
                    }),
                    {
                      transform: 'react-transform-catch-errors',
                      imports: ['react', 'redbox-react'],
                    },
                  ]),
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
            `css?modules&importLoaders=1&localIdentName=${ifProd(
              '[hash:base64]',
              '[name]---[local]---[hash:base64:5]')}!postcss`),
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
    failOnWarning: !!ifProd(),
    failOnError: !!ifProd(),
    emitWarning: true,
    emitError: true,
  },
};

export default webpackConfig;
