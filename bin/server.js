require('babel-register');

const server = require('../server').default;
const config = require('../config').default;

if (config.get('globals').__DEV__) {
  if (!require('piping')({
    hook: true,
    ignore: /(\/\.|~$|\.json)/i,
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
