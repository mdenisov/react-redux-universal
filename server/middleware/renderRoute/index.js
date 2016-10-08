import config from '../../../config';
import { logger } from '../../helpers/logger';
import renderRoute from './renderRoute';
import forms from './forms';
import addDocument from './formsHandlers/addDocument';

const paths = config.get('utils_paths');
const { matchRoute, configureStore, HttpError } = require(paths.dist());

// ------------------------------------
// Rendering Middleware
// ------------------------------------
export default function* () {
  const instanceStore = configureStore();
  const basename = config.get('project_public_path');
  const apiPath = `${config.get('project_public_path')}${config.get('api_path')}`;
  const fullApiPath = `http://${config.get('server_host')}:${config.get('server_port')}${apiPath}`;
  let props;
  try {
    // Get route props
    props = yield matchRoute({
      requestUrl: this.request.url,
      basename,
      createRoutesParams: {
        instanceStore,
        apiPath,
        projectPath: basename,
        fullApiPath,
      },
    });

    // Add handler for AddDocument form
    forms.addFormHandler(addDocument);
    // Verify and process request with form
    yield forms.processingRequest.call(this, {
      next: renderRoute,
      componentProps: {},
      instanceStore,
      renderProps: props,
    });
  } catch (err) {
    if (err instanceof HttpError || err.name === 'HttpError') {
      switch (parseInt(err.statusCode, 10)) {
        case 302:
          this.redirect(err.message);
          return;
        case 404:
          return;
        default :
          logger(`Status code: ${err.statusCode} `, err.message || '');
          throw err;
      }
    } else {
      throw err;
    }
  }
}
