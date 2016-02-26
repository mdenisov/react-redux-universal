import qs from 'qs';
import { combineReducers } from 'redux';

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

/**
 * Добавляет методы assign, reload и replace в переданный объект location
 * (на сервере методы возвращают Promise.reject с первым параметром - 302 и вторым параметром - новым URL;
 * на клиенте вызывают родные методы из объекта window.location)
 * Методы assign и replace принимают как строку в качестве параметра, так и объект с сигнатурой:
 * {path: <новый путь>, query: <объект параметров, преобразующийся в param1=valu1&param2=value2...}
 * @param  {Object} location объект
 * @return {Object} location расширенный объект location
 */
export const extendLocation = (() => {
  const stringifyQuery = (query) => {
    return qs.stringify(query, { arrayFormat: 'repeat' }).replace(/%20/g, '+');
  };
  const parseLocation = (_location) => {
    if (typeof _location === 'object' && _location !== null) {
      let queryString = '';
      if (_location.query) {
        queryString = stringifyQuery(_location.query);
      }
      if (queryString === '') {
        return _location.path;
      }
      return `${_location.path}${_location.path.indexOf('?') !== -1 ? '&' : '?'}${queryString}`;
    }
    return _location;
  };

  return (location) => {
    const newLocation = Object.assign({}, location);
    if (typeof window !== 'undefined') {
      newLocation.assign = path => {
        window.location.assign(parseLocation(path));
      };
      newLocation.reload = forceGet => {
        window.location.reload(forceGet);
      };
      newLocation.replace = path => {
        window.location.replace(parseLocation(path));
      };
    } else {
      newLocation.assign = path => {
        return Promise.reject([302, parseLocation(path)]);
      };
      newLocation.reload = () => {
        return Promise.reject([302, `${location.pathname}${location.search}${location.hash}`]);
      };
      newLocation.replace = path => {
        return Promise.reject([302, parseLocation(path)]);
      };
    }
    return newLocation;
  };
})();

export const fetchComponentData = ({ history, location = {}, dispatch, components, params }) => {
  const newLocation = extendLocation(location);
  const fetchData = components.reduce((prev, current) => {
    if (current) {
      return ((current.WrappedComponent ? current.WrappedComponent.fetchData : (current.fetchData || [])) || [])
        .concat(prev);
    }
    return prev;
  }, []);

  const promises = fetchData.map(need => {
    return dispatch(need(Object.assign({}, params, { history, location: newLocation })));
  });

  return Promise.all(promises);
};

export function deserializeJavascript(source) {
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  let result;
  if (!Array.isArray(source)) {
    if (source['@__Map'] !== undefined) {
      result = new Map();
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
  const result = new Map();
  result.toJSON = () => {
    return { '@__Map': Map.toJSON(result) };
  };
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
    };
  };
};
