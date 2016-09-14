/* eslint-disable global-require */
import { compose, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reduxThunk from 'redux-thunk';
import createStoreHelper from '../helpers/createStore';
import extendStoreManageSagas from '../helpers/extendStoreManageSagas';

const middlewares = [reduxThunk];
if (__CLIENT__ && __REDUX_LOGGER__) {
  // eslint-disable-next-line
  const loggerMiddleware = require('redux-logger')();
  middlewares.push(loggerMiddleware);
}

const sagaMiddleware = createSagaMiddleware();
middlewares.push(sagaMiddleware);

if (!__PROD__) {
  // eslint-disable-next-line
  middlewares.unshift(require('redux-immutable-state-invariant')());
}

const middleware = applyMiddleware(...middlewares);
let createStoreWithMiddleware;
if (__DEBUG__ && __CLIENT__) {
  const devTools = window.devToolsExtension
    ? window.devToolsExtension()
    : require('../components/DevToolsView').default.instrument(); // eslint-disable-line
  createStoreWithMiddleware = compose(middleware, devTools);
} else {
  createStoreWithMiddleware = middleware;
}

export default createStoreHelper(createStoreWithMiddleware(createStore),
  _createStore =>
    (reducer, initialState) => {
      const instanceStore = _createStore(reducer, initialState);
      extendStoreManageSagas(instanceStore, sagaMiddleware);
      return instanceStore;
    }
);
