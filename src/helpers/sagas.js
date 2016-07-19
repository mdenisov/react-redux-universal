/* eslint-disable no-param-reassign */
import { END } from 'redux-saga';

export function extendStore(instanceStore, sagaMiddleware) {
  const regStrSagaID = '^((@@)?[a-zA-Z0-9_]+\\/[a-zA-Z0-9_]+)+$';
  const regSagaID = new RegExp(regStrSagaID);
  const launchedSagas = {};
  instanceStore.runSaga = (saga, ...args) => {
    if (typeof saga !== 'function') {
      throw new Error('saga should be function');
    }
    if (typeof saga.sagaID !== 'string' || !regSagaID.test(saga.sagaID)) {
      throw new Error(
        'Property of the saga sagaID should be string and match' +
        ` with RegExp - /${regStrSagaID}/`
      );
    }
    // If saga isn't launched or saga is cancelled
    if (!launchedSagas[saga.sagaID] ||
      (launchedSagas[saga.sagaID] && !launchedSagas[saga.sagaID].isRunning())) {
      const task = sagaMiddleware.run(saga, ...args);
      launchedSagas[saga.sagaID] = task;
      return task;
    }
    return null;
  };
  instanceStore.stopSagas = () => instanceStore.store.dispatch(END);
  instanceStore.stopSagaByName = sagaID => {
    if (typeof sagaID !== 'string' || !regSagaID.test(sagaID)) {
      throw new Error(`sagaID should be string and match with RegExp - /${regStrSagaID}/`);
    }
    if (launchedSagas[sagaID]) {
      launchedSagas[sagaID].cancel();
    }
  };
  instanceStore.getLaunchedSagas = () => Object.assign({}, launchedSagas);
  return instanceStore;
}
