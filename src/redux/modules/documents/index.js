import { createReducer, mapFromJS } from '../../../helpers/redux';

export const START_LOAD_DOCUMENTS = 'documents/documents/START_LOAD_DOCUMENTS';
export const ERROR_LOAD_DOCUMENTS = 'documents/documents/ERROR_LOAD_DOCUMENTS';
export const FINISH_LOAD_DOCUMENTS = 'documents/documents/FINISH_LOAD_DOCUMENTS';
export const CLEAN_DOCUMENTS = 'documents/documents/CLEAN_DOCUMENTS';

export const cleanDocuments = () => {
  return {
    type: CLEAN_DOCUMENTS,
  };
};

export const startLoadDocuments = () => {
  return {
    type: START_LOAD_DOCUMENTS,
  };
};

export const errorLoadDocuments = () => {
  return {
    type: ERROR_LOAD_DOCUMENTS,
  };
};

export const finishLoadDocuments = documents => {
  return {
    type: FINISH_LOAD_DOCUMENTS,
    documents,
  };
};

const initialState = {
  loading: false,
  error: false,
  value: null,
};

const update = (state, mutations) => Object.assign({}, state, mutations);

export default createReducer(initialState, {
  [START_LOAD_DOCUMENTS]: state => update(state, { loading: true, error: false, value: null }),
  [FINISH_LOAD_DOCUMENTS]: (state, action) => update(state, { loading: false, value: mapFromJS(action.documents) }),
  [ERROR_LOAD_DOCUMENTS]: state => update(state, { loading: false, error: true }),
  [CLEAN_DOCUMENTS]: state => update(state, initialState),
});
