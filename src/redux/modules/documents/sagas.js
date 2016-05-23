/* eslint-disable no-constant-condition */

import { take, call, put, fork, select } from 'redux-saga/effects';
import { startLoadDocuments, errorLoadDocuments, finishLoadDocuments, LOAD_DOCUMENTS } from './index';

// Individual exports for testing
export function* getDocuments() {
  while (true) {
    const action = yield take(LOAD_DOCUMENTS);
    const documents = yield select(state => state.documents.documents);
    // Start load documents on saga
    if (!documents.value && !documents.error) {
      yield put(startLoadDocuments());
      const response = yield call(fetch, `${action.apiPath}/getDocuments`);
      if (response.status !== 200) {
        yield put(errorLoadDocuments());
        continue;
      }
      const result = yield response.json();
      yield put(finishLoadDocuments(result));
    }
  }
}

// Bootstrap sagas
export default function* root() {
  yield [
    fork(getDocuments),
  ];
}
