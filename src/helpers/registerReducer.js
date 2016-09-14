import React, { PropTypes } from 'react';
import isPlainObject from 'lodash/isPlainObject';
import { compose } from 'redux';
import { connect } from 'react-redux';
import shallowCompare from 'react-addons-shallow-compare';
import { createReducer } from './redux';
import warning from './warning';

const UPDATE_STATE = '@@COMPONENT_SET_STATE';

const checkInitialState = (initialState) => {
  if (initialState === null || !isPlainObject(initialState) ||
    Object.keys(initialState).length === 0) {
    throw new Error('Parameter initialState shall be non empty object');
  }
};
const checkRootReducerName = (rootReducerName) => {
  if (typeof rootReducerName !== 'string' || !rootReducerName.length) {
    throw new Error('Parameter rootReducerName shall be non empty string');
  }
};

export default (initialState, rootReducerName = 'ui') => {
  if (typeof initialState !== 'undefined') {
    checkInitialState(initialState);
  }
  if (initialState) {
    checkRootReducerName(rootReducerName);
  }

  // Function for update is state in components
  const setState = (dispatch, getState) => (newState, rootReducerName1 = 'ui') => {
    const updatedKeys = Object.keys(newState);

    if (process.env.NODE_ENV !== 'production') {
      if (!isPlainObject(newState) || !updatedKeys.length) {
        warning('Parameter state shall be non empty object');
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const state = getState();
      if (!state[rootReducerName1]) {
        warning(`${rootReducerName1} isn't found in state`);
      } else {
        const notFoundKeys = updatedKeys.filter(key => !state[rootReducerName1][key]);
        if (notFoundKeys.length) {
          warning(`Properties ${notFoundKeys.join(',')} isn't found in "${rootReducerName1}" ` +
          'state');
        }
      }
    }
    updatedKeys.forEach(key => {
      if (process.env.NODE_ENV !== 'production') {
        if (!isPlainObject(newState[key])) {
          warning('Properties of state shall be objects');
        }
      }
      dispatch({
        type: UPDATE_STATE,
        newState: newState[key],
        instance: key,
        rootReducerName: rootReducerName1 });
    });
  };

  // Create reducer bounded on rootReducerName and instance
  const createBoundedReducer = (rootReducerName1, instance, initialState1) =>
    (state = initialState1, action = null) => {
      if (action.instance && typeof action.instance === 'string' && action.instance === instance &&
          action.rootReducerName && typeof action.rootReducerName === 'string' &&
          action.rootReducerName === rootReducerName1
      ) {
        return createReducer(state, {
          [UPDATE_STATE]: (state1, action1) => ({
            ...state1,
            ...action1.newState,
          }),
        })(state, action);
      }
      return state;
    };

  // Runtime register reducer
  const registerReducer = (instanceStore) => (initialState1, rootReducerName1 = 'ui') => {
    checkInitialState(initialState1);
    checkRootReducerName(rootReducerName1);

    const keysInitialState = Object.keys(initialState1);

    const reducer = {
      [rootReducerName1]: {},
    };
    keysInitialState.forEach(key => {
      if (!isPlainObject(initialState1[key])) {
        throw new Error('Properties of initial state shall be objects');
      }

      reducer[rootReducerName1][key] =
        createBoundedReducer(rootReducerName1, key, initialState1[key]);
    });

    instanceStore.registerReducer(reducer);
  };

  if (initialState) {
    const keysInitialState = Object.keys(initialState);

    const reducer = {
      [rootReducerName]: {},
    };
    const getStates = [];
    keysInitialState.forEach(key => {
      if (!isPlainObject(initialState[key])) {
        throw new Error('Properties of initial state shall be objects');
      }

      reducer[rootReducerName][key] = createBoundedReducer(rootReducerName, key, initialState[key]);

      const getState = compose(
        (state) => state[key],
        (state) => state[rootReducerName],
      );
      getStates.push([key, getState]);
    });

    const connectGetStates = (state) =>
      getStates.reduce((prev, el) => {
        prev[el[0]] = el[1](state); //eslint-disable-line
        return prev;
      }, {});

    return (WrappedComponent) => {
      const ConnectComponent = connect(connectGetStates)(WrappedComponent);
      return class RegisterReducer extends React.Component {
        static contextTypes = {
          instanceStore: PropTypes.object,
        };

        constructor(props, context) {
          super(props, context);
          const { instanceStore } = context;
          this.setReduxState = setState(instanceStore.store.dispatch, instanceStore.store.getState);
          this.registerReducer = registerReducer(instanceStore);
        }

        componentWillMount() {
          const { instanceStore } = this.context;
          instanceStore.registerReducer(reducer);
        }

        shouldComponentUpdate(nextProps, nextState) {
          return shallowCompare(this, nextProps, nextState);
        }

        render() {
          return (
            <ConnectComponent
              {...this.props}
              setReduxState={this.setReduxState}
              registerReducer={this.registerReducer}
            />
          );
        }
      };
    };
  }

  return (WrappedComponent) =>
    class RegisterReducer extends React.Component { //eslint-disable-line
      static contextTypes = {
        instanceStore: PropTypes.object,
      };

      constructor(props, context) {
        super(props, context);
        const { instanceStore } = context;
        this.setReduxState = setState(instanceStore.store.dispatch, instanceStore.store.getState);
        this.registerReducer = registerReducer(instanceStore);
      }

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      render() {
        return (
          <WrappedComponent
            {...this.props}
            setReduxState={this.setReduxState}
            registerReducer={this.registerReducer}
          />
        );
      }
    };
};
