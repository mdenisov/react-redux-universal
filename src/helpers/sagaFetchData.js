import { call, put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';

const FETCH_DATA = '@@APP/FETCH_DATA';

const checkAction = (action, actionName) => {
  if (typeof action !== 'function') {
    throw new Error(`${actionName} must be actionCreator`);
  }
};

function* _fetchData({ url, fetchOptions, startAction, errorAction, finishAction }) {
  // Check action payload
  if (typeof url !== 'string') {
    throw new Error('URL shall be string');
  }
  checkAction(startAction, 'startAction');
  checkAction(errorAction, 'errorAction');
  checkAction(finishAction, 'finishAction');

  // Dispatch startAction
  yield put(startAction());
  // Run fetch request
  const response = yield call(fetch, url, fetchOptions);
  // If error then dispatch errorAction
  if (!response || response.status !== 200) {
    yield put(errorAction(response));
    return;
  }
  // Parse response-json
  try {
    const result = yield response.json();
    // Dispatch finishAction with results
    yield put(finishAction(result));
  } catch (ex) {
    // If error parse json then dispatch errorAction
    yield put(errorAction(response, ex));
    return;
  }
}

export default function* fetchSaga() {
  // wait action fetchData
  yield takeEvery(FETCH_DATA, _fetchData);
}
fetchSaga.sagaID = FETCH_DATA;

export const fetchData = (args) => ({
  type: FETCH_DATA,
  ...args,
});
