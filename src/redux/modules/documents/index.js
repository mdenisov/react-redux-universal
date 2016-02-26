import { init as initDocuments } from './documents';
import config from '../../../config';

// Prefetch data
export const init = params => {
  return async (dispatch, getState) => {
    await dispatch(initDocuments(Object.assign({}, params, { state: getState().documents.documents, services: getState().documents.page.services })));
  };
};

const initialState = {
  services: {
    getDocuments: `${config.apiPath}/getDocuments`,
  },
};

export default (state = initialState) => state;
