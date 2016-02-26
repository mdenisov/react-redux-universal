import koa from 'koa';
import serve from 'koa-static';
import config from '../config';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import logger from 'koa-logger';
import renderRoute from './middleware/renderRoute';
import router from './middleware/api';
import compress from 'koa-compress';
import favicon from 'koa-favicon';

const paths = config.get('utils_paths');
const globals = config.get('globals');
const app = koa();

// Logging requests/responses
app.use(logger());

// Parsing request body (POST, PUT)
app.use(bodyParser());

// Compress response
app.use(compress());

// Serve is favicon in dev mode, because in prod need serve of front server (apache, nginx, etc...)
if (globals.__DEV__) {
  app.use(favicon(path.join(config.get('path_project'), 'public/favicon.ico')));
}

// Share statics in public/client
app.use(serve(paths.public('client'), {
  index: '__IGNORE_INDEX.HTML__',
}));

app.use(serve(path.join(config.get('path_project'), 'public')));

// Processing requests API
app.use(router.routes());

// View Rendering
app.use(renderRoute);

export default app;
