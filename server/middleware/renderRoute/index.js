import config from '../../../config';
import { logger } from '../../helpers/logger';
import renderRoute from './renderRoute';
import forms from './forms';
import addDocument from './formsHandlers/addDocument';

const paths = config.get('utils_paths');
const { route, configureStore } = require(paths.dist('server'));

// ------------------------------------
// Rendering Middleware
// ------------------------------------
export default function* () {
  const instanceStore = configureStore();
  let props;
  try {
    // Get route props
    props = yield route({ requestUrl: this.request.url, instanceStore, basename: config.get('project_public_path') });

    // Add handler for AddDocument form
    forms.addFormHandler(addDocument);
    // Verify and process request with form
    yield forms.processingRequest.call(this, { next: renderRoute, componentProps: {}, instanceStore, renderProps: props });
  } catch (err) {
    if (Array.isArray(err)) {
      switch (parseInt(err[0], 10)) {
        case 302:
          this.redirect(`${config.get('project_public_path')}${err[1]}`);
          return;
        case 404:
          this.redirect(`${config.get('project_public_path')}/`);
          return;
        default :
          if (err[1]) {
            logger(`Status code: ${err[0]} `, err[1]);
          }
          throw err;
      }
    } else {
      throw err;
    }
  }
}
