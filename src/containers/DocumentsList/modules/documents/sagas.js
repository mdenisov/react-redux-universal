import { call, put } from 'redux-saga/effects';
import { startLoadDocuments, errorLoadDocuments, finishLoadDocuments } from './index';

export default function* getDocuments({ apiPath }) {
  // Start load documents on saga
  yield put(startLoadDocuments());
  const response = yield call(fetch, `${apiPath}/getDocuments`);
  if (response.status !== 200) {
    yield put(errorLoadDocuments(response.statusText));
    return;
  }
  const result = yield response.json();
  yield put(finishLoadDocuments(result));
}
getDocuments.sagaID = 'documentsList/documents';
