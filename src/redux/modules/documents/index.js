import { createReducer, mapFromJS } from '../../../helpers/redux';

export const LOAD_DOCUMENTS = 'documents/documents/LOAD_DOCUMENTS';
export const CLEAN_DOCUMENTS = 'documents/documents/CLEAN_DOCUMENTS';

// Get documents from server
const getDocuments = ({ apiPath }) => {
  return async (dispatch, getState) => {
    if (!getState().documents.documents.size) {
      const response = await fetch(`${apiPath}/getDocuments`);
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const documents = await response.json();
      dispatch({
        type: LOAD_DOCUMENTS,
        documents,
      });
    }
  };
};

// Prefetch data
export const init = (params) => {
  return async dispatch => {
    await Promise.all([
      dispatch(getDocuments(params)),
    ]);
  };
};

export const cleanDocuments = () => {
  return {
    type: CLEAN_DOCUMENTS,
  };
};

const initialState = {};

export default createReducer(initialState, {
  [LOAD_DOCUMENTS]: (state, action) => mapFromJS(action.documents),
  [CLEAN_DOCUMENTS]: () => ({}),
});
