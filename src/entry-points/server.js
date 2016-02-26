import createRoutes from '../routes';
import { match } from 'react-router';

export configureStore from '../redux/init';
export { fetchComponentData } from '../helpers/redux';
if (__DEBUG__) {
  exports.DevToolsView = require('../components/DevToolsView');
}

export const route = ({ requestUrl, instanceStore, basename }) => {
  return new Promise((resolve, reject) => {
    const routes = createRoutes(instanceStore);
    match({ routes, location: requestUrl, basename }, (err, redirectLocation, renderProps) => {
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
