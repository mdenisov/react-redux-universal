import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import logger from 'koa-logger';
import compress from 'koa-compress';
import favicon from 'koa-favicon';
import send from 'koa-send';
import config from '../config';
import renderRoute from './middleware/renderRoute';
import router from './middleware/api';


const globals = config.get('globals');
const app = koa();

// Logging requests/responses
app.use(logger());

// Parsing request body (POST, PUT)
app.use(bodyParser());

// Compress response
app.use(compress());

// Serve is statics in dev mode, because in prod need serve of front server (apache, nginx, etc...)
if (globals.__DEV__) {
  // Serve favicon
  app.use(favicon(path.join(config.get('path_project'), 'public/favicon.ico')));

  // Serve function
  const serveStatic = (root, opts = {}, baseName = '') => {
    const newOpts = { ...opts };
    newOpts.root = path.resolve(root);
    if (newOpts.index !== false) newOpts.index = newOpts.index || 'index.html';
    return function* serve(next) {
      if (this.method === 'HEAD' || this.method === 'GET') {
        let servePath = this.path;
        if (baseName.length &&
            this.path.indexOf(baseName) === 0) {
          servePath = this.path.substr(baseName.length);
        }
        if (yield send(this, servePath, newOpts)) return;
      }
      yield* next;
    };
  };

  // Serve statics in public/client
  app.use(serveStatic(config.get('path_project'), {
    index: '__IGNORE_INDEX.HTML__',
  }, config.get('project_public_path')));
}

// Processing requests API
app.use(router.routes());

// View Rendering
app.use(renderRoute);

export default app;
