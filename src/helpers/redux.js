import { combineReducers } from 'redux';
import { createRouter } from './router';
import { extendLocation } from './location';

export const createReducer = (initialState, reducerMap) => {
  if (typeof reducerMap !== 'object' || reducerMap === null) {
    throw new Error(`Reducer map isn't valid`);
  }

  return (state = initialState, action = null) => {
    if (action.type === undefined) {
      throw new Error('Property type in action === undefined');
    }
    const reducer = reducerMap[action.type];

    return reducer ? reducer(state, action) : state;
  };
};

export const fetchComponentData = ({ history, location, basename, dispatch, components, apiPath, params }) => {
  const router = createRouter(history, basename);
  let newLocation;
  if (location) {
    newLocation = extendLocation(location);
  }
  const fetchData = components.reduce((prev, current) => {
    if (current) {
      return (current.WrappedComponent && Array.isArray(current.WrappedComponent.fetchData) ? current.WrappedComponent.fetchData : (current.fetchData || []))
        .concat(prev);
    }
    return prev;
  }, []);

  const promises = fetchData.map(need => {
    return dispatch(need(Object.assign({}, params, { router, location: newLocation, apiPath })));
  });

  return Promise.all(promises);
};

export function createSerializedMap(map) {
  map.toJSON = () => {
    const result = [];
    map.forEach((value, key) => {
      result.push([key, value]);
    });
    return { '@__Map': result };
  };
  return map;
}

export function deserializeJavascript(source) {
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  let result;
  if (!Array.isArray(source)) {
    if (source['@__Map'] !== undefined) {
      result = createSerializedMap(new Map());
      source['@__Map'].forEach(value => {
        if (typeof value[1] === 'object' && value[1] !== null) {
          result.set(value[0], deserializeJavascript(value[1]));
        } else {
          result.set(value[0], value[1]);
        }
      });
    } else {
      result = {};
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null) {
            result[key] = deserializeJavascript(source[key]);
          } else {
            result[key] = source[key];
          }
        }
      }
    }
  } else {
    result = [];
    source.forEach(value => {
      if (typeof value === 'object' && value !== null) {
        result.push(deserializeJavascript(value));
      } else {
        result.push(value);
      }
    });
  }
  return result;
}

export function mapFromJS(source) {
  const result = createSerializedMap(new Map());
  if (Array.isArray(source)) {
    source.forEach((value, index) => {
      if (Array.isArray(value) && value.length === 2) {
        if (typeof value[1] === 'object' && value[1] !== null) {
          result.set(value[0], mapFromJS(value[1]));
        } else {
          result.set(value[0], value[1]);
        }
      } else if (typeof value === 'object' && value !== null) {
        result.set(index, mapFromJS(value));
      } else {
        result.set(index, value);
      }
    });
  } else if (typeof source === 'object' && source !== null) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          result.set(key, mapFromJS(source[key]));
        } else {
          result.set(key, source[key]);
        }
      }
    }
  }
  return result;
}

export const createStore = (createStoreWithMiddleware) => {
  return (initialState, _reducer) => {
    let reducers = {};
    let store;

    // Add reducer in store
    const registerReducer = (reducer, replaceReducer = false) => {
      if (reducer === null || typeof reducer !== 'object' || Object.keys(reducer).length === 0) {
        throw new Error(`The reducer shall be non empty object`);
      }
      if (replaceReducer) {
        reducers = {};
      }
      Object.assign(reducers, reducer);
      if (store) {
        store.replaceReducer(combineReducers(reducers));
      }
    };

    // Delete reducer from store
    const unRegisterReducer = reducerName => {
      if (typeof reducerName !== 'string') {
        throw new Error(`The reducerName should be string`);
      }
      delete reducers[reducerName];
      if (store) {
        store.replaceReducer(combineReducers(reducers));
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
    };
  };
};
