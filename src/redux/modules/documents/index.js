import { createReducer } from '../../../helpers/redux';

export const START_LOAD_DOCUMENTS = 'documentsList/documents/START_LOAD_DOCUMENTS';
export const ERROR_LOAD_DOCUMENTS = 'documentsList/documents/ERROR_LOAD_DOCUMENTS';
export const FINISH_LOAD_DOCUMENTS = 'documentsList/documents/FINISH_LOAD_DOCUMENTS';
export const CLEAN_DOCUMENTS = 'documentsList/documents/CLEAN_DOCUMENTS';

export const cleanDocuments = () => ({
  type: CLEAN_DOCUMENTS,
});

export const fetchData = (apiPath) => ({
  startAction: () => ({
    type: START_LOAD_DOCUMENTS,
  }),
  errorAction: (response, ex) => ({
    type: ERROR_LOAD_DOCUMENTS,
    error: response.statusText || (ex && ex.message) || '',
  }),
  finishAction: (documents) => ({
    type: FINISH_LOAD_DOCUMENTS,
    documents,
  }),
  url: `${apiPath}/getDocuments`,
});

export const getDocuments = (state) =>
  state.value;

export const getError = (state) =>
  state.error;

export const isLoading = (state) =>
  state.loading;

const initialState = {
  loading: false,
  error: null,
  value: null,
};

export default createReducer(initialState, {
  [START_LOAD_DOCUMENTS]: (state) =>
    ({ ...state, loading: true, error: null, value: null }),
  [FINISH_LOAD_DOCUMENTS]: (state, action) =>
    ({ ...state, loading: false, value: action.documents }),
  [ERROR_LOAD_DOCUMENTS]: (state, action) =>
    ({ ...state, loading: false, error: action.error }),
  [CLEAN_DOCUMENTS]: () => initialState,
});
