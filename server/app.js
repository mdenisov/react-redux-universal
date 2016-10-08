import { match } from 'react-router';
import createRoutes from '../src/routes';
import { HttpError } from '../src/helpers/customErrors';

export extendLocation from '../src/helpers/extendLocation';
export { default as configureStore } from '../src/redux/init';
export * from '../src/helpers/customErrors.js';

export const matchRoute = ({ requestUrl, createRoutesParams, basename }) =>
  new Promise((resolve, reject) => {
    const routes = createRoutes(createRoutesParams);
    let location = requestUrl;
    if (location.indexOf(basename) === 0) {
      location = location.substr(basename.length);
    }
    if (!location.length) {
      location = '/';
    }
    match({ routes, location, basename }, (err, redirectLocation, renderProps) => {
      if (err) {
        reject(err);
      } else if (redirectLocation) {
        throw new HttpError(
          302,
          `${basename}${redirectLocation.pathname}${redirectLocation.search}` +
          `${redirectLocation.hash}`
        );
      } else if (renderProps) {
        resolve(renderProps);
      } else {
        throw new HttpError(404);
      }
    });
  });

if (__HMR__ && module.hot) {
  module.hot.accept();
}
