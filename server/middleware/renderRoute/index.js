import config from '../../../config';
import { logger } from '../../helpers/logger';
import renderRoute from './renderRoute';
import forms from './forms';
import addDocument from './formsHandlers/addDocument';

const paths = config.get('utils_paths');
const { matchRoutes, configureStore, HttpError } = require(paths.dist('server'));

// ------------------------------------
// Rendering Middleware
// ------------------------------------
export default function* () {
  const instanceStore = configureStore();
  const basename = config.get('project_public_path');
  let props;
  try {
    // Get route props
    props = yield matchRoutes({
      requestUrl: this.request.url,
      basename,
      createRoutesParams: {
        instanceStore,
      },
    });

    // Add handler for AddDocument form
    forms.addFormHandler(addDocument);
    // Verify and process request with form
    yield forms.processingRequest.call(this, { next: renderRoute, componentProps: {}, basename, instanceStore, renderProps: props });
  } catch (err) {
    if (err instanceof HttpError || err.name === 'HttpError') {
      switch (parseInt(err.statusCode, 10)) {
        case 302:
          this.redirect(err.message);
          return;
        case 404:
          this.redirect(`${basename}/`);
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
