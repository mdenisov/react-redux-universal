require('babel-register');

const devServer = require('../build/webpack-dev-server').default;
const config = require('../config').default;

const port = config.get('webpack_port');
const host = config.get('webpack_host');
devServer.listen(port, host, () => {
  global.console.log(`Webpack dev server running at ${host}:${port}`);
});
