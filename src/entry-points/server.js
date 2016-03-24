import createRoutes from '../routes';
import { match } from 'react-router';

export { fetchComponentData } from '../helpers/redux';
export configureStore from '../redux/init';

export const route = ({ requestUrl, instanceStore, basename }) => {
  return new Promise((resolve, reject) => {
    const routes = createRoutes(instanceStore);
    let location = requestUrl;
    if (location.indexOf(basename) === 0) {
      location = location.substr(basename.length);
    }
    match({ routes, location, basename }, (err, redirectLocation, renderProps) => {
      if (err) {
        reject([500], err);
      } else if (redirectLocation) {
        reject([302, `${redirectLocation.pathname}${redirectLocation.search}${redirectLocation.hash}`]);
      } else if (renderProps) {
        resolve(renderProps);
      } else {
        reject([404]);
      }
    });
  });
};
