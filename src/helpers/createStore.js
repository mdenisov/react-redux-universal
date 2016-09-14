import { combineReducers } from 'redux';
import isPlainObject from 'lodash/isPlainObject';

const createStore = (createStoreWithMiddleware, enhancer) => {
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }
    return enhancer(createStore(createStoreWithMiddleware));
  }

  return (_reducer, initialState) => {
    let reducers = {};
    let rawReducers = {};
    let store;

    const reCreateReducers = () => {
      reducers = {};
      Object.keys(rawReducers).forEach(key => {
        if (typeof rawReducers[key] === 'function') {
          reducers[key] = rawReducers[key];
        } else if (isPlainObject(rawReducers[key])) {
          reducers[key] = combineReducers(rawReducers[key]);
        } else {
          throw new Error(`Unknown type property ${key} of reducer`);
        }
      });
    };

    // Reload reducers
    const reloadReducers = () => {
      if (store) {
        store.replaceReducer(combineReducers(reducers));
      }
    };

    // Add reducer in store
    const registerReducer = (reducer, replaceReducer = false) => {
      if (reducer === null || !isPlainObject(reducer) || Object.keys(reducer).length === 0) {
        throw new Error('The reducer shall be non empty object');
      }
      Object.keys(reducer).forEach(key => {
        if (typeof reducer[key] !== 'function' && !isPlainObject(reducer[key])) {
          throw new Error('Properties of reducer shall be functions or objects');
        }
      });
      if (replaceReducer) {
        rawReducers = {};
      }
      Object.keys(reducer).forEach(key => {
        if (typeof reducer[key] !== 'function' && rawReducers[key]) {
          Object.assign(rawReducers[key], reducer[key]);
        } else {
          rawReducers[key] = reducer[key];
        }
      });
      reCreateReducers();
      reloadReducers();
    };

    // Delete reducer from store
    const unRegisterReducer = (reducer) => {
      if (typeof reducer !== 'string' && !isPlainObject(reducer)) {
        throw new Error('The reducer shall be string or object');
      }
      let needReload = false;
      if (typeof reducer === 'string' && rawReducers[reducer]) {
        needReload = true;
        delete reducers[reducer];
        delete rawReducers[reducer];
      }
      if (isPlainObject(reducer)) {
        Object.keys(reducer).forEach(key => {
          if (rawReducers[key]) {
            if (isPlainObject(reducer[key])) {
              Object.keys(reducer[key]).forEach(key1 => {
                if (rawReducers[key][key1]) {
                  needReload = true;
                  delete rawReducers[key][key1];
                  reCreateReducers();
                }
              });
            } else {
              needReload = true;
              delete reducers[key];
              delete rawReducers[key];
            }
          }
        });
      }
      if (needReload) {
        reloadReducers();
      }
    };

    if (typeof _reducer === 'object' && _reducer !== null && Object.keys(_reducer).length) {
      registerReducer(_reducer);
      store = createStoreWithMiddleware(combineReducers(reducers), initialState);
    } else {
      store = createStoreWithMiddleware(() => ({}));
    }

    return {
      registerReducer,
      store,
      getReducers: () => reducers,
      unRegisterReducer,
      reloadReducers,
    };
  };
};

export default createStore;
