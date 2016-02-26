import { combineReducers } from 'redux';
import documents from './documents';
import page from './index';

export default combineReducers({
  documents,
  page,
});
