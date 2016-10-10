if (process.env.NODE_ENV !== 'production') {
  require('babel-register'); // eslint-disable-line
}

// Run gc every minute if node runned with option --expose-gc
if (process.env.NODE_ENV === 'production') {
  if (global.gc) {
    setInterval(() => {
      try {
        global.gc();
      } catch (e) {
        global.console.log(`${e.name}: ${e.message}`);
      }
    }, 60000);
  }
}

require('regenerator-runtime/runtime');

const server = require('../server').default;
const config = require('../config').default;

if (config.get('globals').__DEV__) {
  const ignore = new RegExp(
    `(\\/\\.|~$|\\.json$|^${config.get('path_project').replace('/', '\\/')}\\/dist\\/)`, 'i');
  if (!require('piping')({ // eslint-disable-line
    hook: true,
    ignore,
  })) {
    return;
  }
}

const port = config.get('server_port');
const host = config.get('server_host');
if (port === undefined) {
  throw new Error('Koa port is undefined');
}
if (host === undefined) {
  throw new Error('Koa host is undefined');
}

server.listen(port, host);
global.console.log(`Koa server listening: ${host}:${port}`);
