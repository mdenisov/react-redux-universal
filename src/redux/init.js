import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createStore as createStoreHelper } from '../helpers/redux';

let createStoreWithMiddleware;
let middleware;
if (__CLIENT__ && __REDUX_LOGGER__) {
  const loggerMiddleware = require('redux-logger')();
  middleware = applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  );
} else {
  middleware = applyMiddleware(
    thunkMiddleware
  );
}
if (__DEBUG__ && __CLIENT__) {
  const devTools = window.devToolsExtension
    ? window.devToolsExtension()
    : require('../components/DevToolsView').default.instrument();
  createStoreWithMiddleware = compose(middleware, devTools);
} else {
  createStoreWithMiddleware = middleware;
}

export default createStoreHelper(createStoreWithMiddleware(createStore));
