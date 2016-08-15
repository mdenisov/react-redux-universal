import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server'; // eslint-disable-line
import config from '../config';
import webpackConfig from './webpack/client';

const paths = config.get('utils_paths');

const server = new WebpackDevServer(webpack(webpackConfig), {
  contentBase: paths.project(config.get('dir_src')),
  hot: true,
  https: false,
  inline: true,
  quiet: true,
  lazy: false,
  stats: {
    colors: true,
  },
  watchOptions: {
    aggregateTimeout: 100,
  },
  headers: { 'Access-Control-Allow-Origin': '*' },
  historyApiFallback: true,
});

export default server;
