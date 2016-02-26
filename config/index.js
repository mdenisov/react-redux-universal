process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();

import path from 'path';
import { argv } from 'yargs';
import _debug from 'debug';

const debug = _debug('app:config:global');
const config = new Map();

// ------------------------------------
// Environment
// ------------------------------------
config.set('env', process.env.NODE_ENV);
config.set('globals', {
  __DEV__: config.get('env') === 'development',
  __PROD__: config.get('env') === 'production',
  __DEBUG__: (config.get('env') === 'development' && !argv.no_debug),
  __HMR__: !!argv.hmr,
  __REDUX_LOGGER__: !!argv.redux_logger,
});

// ------------------------------------
// User Configuration
// ------------------------------------
config.set('dir_src', 'src');
config.set('dir_dist', 'dist');
config.set('dir_public', 'public');

config.set('server_host', process.env.NODE_HOST);
config.set('server_port', process.env.NODE_PORT);
config.set('webpack_host', process.env.NODE_HOST);
config.set('webpack_port', 3000);

config.set('vendor_dependencies', [
  'classnames',
  'es6-promise',
  'history',
  'whatwg-fetch',
  'react',
  'react-dom',
  'react-helmet',
  'react-redux',
  'react-router',
  'react-addons-shallow-compare',
  'redux',
  'redux-thunk',
  'babel-polyfill',
  'scroll-behavior',
  'qs',
  'redux-form',
  'redux-form-schema',
]);

// ------------------------------------
// Webpack
// ------------------------------------
config.set('webpack_public_path',
  `http://${config.get('webpack_host')}:${config.get('webpack_port')}/`
);

// ------------------------------------
// Project
// ------------------------------------
config.set('path_project', path.resolve(__dirname, '../'));
config.set('project_public_path', process.env.PROJECT_PATH);
config.set('api_path', '/api');

// ------------------------------------
// Utilities
// ------------------------------------
const paths = (() => {
  const base = [config.get('path_project')];
  const resolve = path.resolve;

  const project = (...args) => resolve.apply(resolve, [...base, ...args]);

  return {
    project,
    src: project.bind(null, config.get('dir_src')),
    dist: project.bind(null, config.get('dir_dist')),
    public: project.bind(null, config.get('dir_public')),
  };
})();

config.set('utils_paths', paths);

// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json');

config.set('vendor_dependencies', config.get('vendor_dependencies')
  .filter(dep => {
    if (pkg.dependencies[dep]) return true;

    debug(
      `Package "${dep}" was not found as an npm dependency in package.json; ` +
      `it won't be included in the webpack vendor bundle.\n` +
      `Consider removing it from vendor_dependencies in ~/config/index.js`
    );
  })
);

export default config;
