/* eslint-disable no-param-reassign */
import { END } from 'redux-saga';
import { bindActionCreators } from 'redux';
import sagaFetchData, { fetchData } from './sagaFetchData';

export default function extendStore(instanceStore, sagaMiddleware) {
  const regStrSagaID = '^@{0,2}[a-zA-Z0-9_]+(\\/[a-zA-Z0-9_]+)*$';
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

  // Run saga fetch data
  instanceStore.runSaga(sagaFetchData);
  // Save action creator for fetch data in instanceStore
  instanceStore.fetchData = bindActionCreators(fetchData, instanceStore.store.dispatch);

  return instanceStore;
}
