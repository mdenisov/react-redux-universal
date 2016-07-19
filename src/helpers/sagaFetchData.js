import { call, put, take } from 'redux-saga/effects';

const FETCH_DATA = '@@APP/FETCH_DATA';

export const fetchData = (args) => ({
  type: FETCH_DATA,
  ...args,
});

const checkAction = (action, actionName) => {
  if (typeof action !== 'function') {
    throw new Error(`${actionName} shall be actionCreator`);
  }
};

export default function* _fetchData() {
  while (true) { // eslint-disable-line
    // wait action fetchData
    const { url, fetchOptions, startAction, errorAction, finishAction } = yield take(FETCH_DATA);

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
      continue;
    }
    // Parse response-json
    try {
      const result = yield response.json();
      // Dispatch finishAction with results
      yield put(finishAction(result));
    } catch (ex) {
      // If error parse json then dispatch errorAction
      yield put(errorAction(response, ex));
      continue;
    }
  }
}
_fetchData.sagaID = FETCH_DATA;
