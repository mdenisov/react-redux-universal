import React, { PropTypes } from 'react';
import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import genUUIDv4 from './genUUIDv4';

const regActionStr = '^@{0,2}[a-zA-Z0-9_]+(\\/[a-zA-Z0-9_]+)*$';
const regAction = new RegExp(regActionStr);

const createListeningSagas = actions => WrappedComponent => {
  if (typeof actions !== 'string' && !Array.isArray(actions)) {
    throw new Error('Parameter actions should be string or array');
  }
  const _actions = typeof actions === 'string' ? [actions] : actions;
  class ListeningSagas extends React.Component {
    static contextTypes = {
      instanceStore: PropTypes.object,
    }

    constructor(props) {
      super(props);
      this.actionListeners = {};
      this.subscribeListeningSagas = this.subscribeListeningSagas.bind(this);
      this.launchedSagas = [];
    }

    componentWillMount() {
      const { instanceStore } = this.context;
      _actions.forEach((action) => {
        if (!regAction.test(action)) {
          throw new Error(`Parameter action should be match with RegExp - /${regActionStr}/`);
        }
        this.actionListeners[action] = [];
        const self = this;
        function* listenAction() {
          yield* takeEvery(action, function* runActionListeners(data) {
            yield self.actionListeners[action].map(cb => call(cb, data));
          });
        }
        listenAction.sagaID = `${action}/${genUUIDv4().replace(/-/g, '_')}`;
        this.launchedSagas.push(instanceStore.runSaga(listenAction));
      });
    }

    componentWillUnmount() {
      this.launchedSagas.forEach(launchedSaga => launchedSaga.cancel());
      this.actionListeners = {};
      this.launchedSagas = [];
    }

    subscribeListeningSagas(action, cb) {
      if (!regAction.test(action)) {
        throw new Error(`Parameter action should be match with RegExp - /${regActionStr}/`);
      }
      if (!this.actionListeners[action]) {
        throw new Error(`Saga is listening action ${action} not registered`);
      }
      this.actionListeners[action].push(cb);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          subscribeListeningSagas={this.subscribeListeningSagas}
        />
      );
    }
  }

  return ListeningSagas;
};

export default createListeningSagas;
