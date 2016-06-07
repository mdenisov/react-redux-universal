import documents, * as fromDocuments from './documents';

export default {
  documents,
};

export const getDocuments = (state) =>
  fromDocuments.getDocuments(state.documents);

export const getError = (state) =>
  fromDocuments.getError(state.documents);

export const isLoading = (state) =>
  fromDocuments.isLoading(state.documents);
