import { END } from 'redux-saga';

export function extendStore(instanceStore, sagaMiddleware) {
  const regStrSagaName = '([a-zA-Z0-9_]+\/[a-zA-Z0-9_]+)+';
  const regSagaName = new RegExp(regStrSagaName);
  const launchedSagas = {};
  instanceStore.runSaga = (sagaName, saga, ...args) => {
    if (typeof sagaName !== 'string' || !regSagaName.test(sagaName)) {
      throw new Error(`sagaName should be string and match with RegExp - /${regStrSagaName}/`);
    }
    if (typeof saga !== 'function') {
      throw new Error('saga should be function');
    }
    // If saga isn't launched or saga is cancelled
    if (!launchedSagas[sagaName] || (launchedSagas[sagaName] && !launchedSagas[sagaName].isRunning())) {
      const task = sagaMiddleware.run(saga, ...args);
      launchedSagas[sagaName] = task;
      return task;
    }
  };
  instanceStore.stopSagas = () => instanceStore.store.dispatch(END);
  instanceStore.stopSagaByName = sagaName => {
    if (typeof sagaName !== 'string' || !regSagaName.test(sagaName)) {
      throw new Error(`sagaName should be string and match with RegExp - /${regStrSagaName}/`);
    }
    if (launchedSagas[sagaName]) {
      launchedSagas[sagaName].cancel();
    }
  };
  instanceStore.getLaunchedSagas = () => Object.assign({}, launchedSagas);
  return instanceStore;
}
