import createRoutes from '../routes';
import { match } from 'react-router';
import { HttpError } from '../helpers/customErrors';

export { fetchComponentData } from '../helpers/redux';
export { extendLocation } from '../helpers/location';
export { default as configureStore } from '../redux/init';
export * from '../helpers/customErrors.js';

export const matchRoutes = ({ requestUrl, createRoutesParams, basename }) =>
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
