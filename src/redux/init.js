import { compose, createStore, applyMiddleware } from 'redux';
import { createStore as createStoreHelper } from '../helpers/redux';
import createSagaMiddleware, { END } from 'redux-saga';
import reduxThunk from 'redux-thunk';

const middlewares = [reduxThunk];
if (__CLIENT__ && __REDUX_LOGGER__) {
  const loggerMiddleware = require('redux-logger')();
  middlewares.push(loggerMiddleware);
}

const sagaMiddleware = createSagaMiddleware();
middlewares.push(sagaMiddleware);

if (!__PROD__) {
  middlewares.unshift(require('redux-immutable-state-invariant')());
}

const middleware = applyMiddleware(...middlewares);
let createStoreWithMiddleware;
if (__DEBUG__ && __CLIENT__) {
  const devTools = window.devToolsExtension
    ? window.devToolsExtension()
    : require('../components/DevToolsView').default.instrument();
  createStoreWithMiddleware = compose(middleware, devTools);
} else {
  createStoreWithMiddleware = middleware;
}

export default createStoreHelper(createStoreWithMiddleware(createStore),
  _createStore =>
    (initialState, reducer) => {
      const instanceStore = _createStore(initialState, reducer);
      if (__SERVER__) {
        instanceStore.launchedSagas = [];
        instanceStore.runSaga = (saga, ...args) => {
          const task = sagaMiddleware.run(saga, ...args);
          instanceStore.launchedSagas.push(task);
          return task;
        };
      } else {
        instanceStore.runSaga = sagaMiddleware.run;
      }
      instanceStore.stopSagas = () => instanceStore.store.dispatch(END);
      return instanceStore;
    }
);
