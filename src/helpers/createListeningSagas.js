import React, { PropTypes } from 'react';
import { takeEvery } from 'redux-saga';

const regActionStr = '([a-zA-Z0-9_]+(\\/[a-zA-Z0-9_]+)?)+';
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
          yield* takeEvery(action, (data) => {
            self.actionListeners[action].forEach(cb => cb(data));
          });
        }
        listenAction.sagaID = `listen_${action}`;
        instanceStore.runSaga(listenAction);
      });
    }

    componentWillUnmount() {
      const { instanceStore } = this.context;
      _actions.forEach(action => {
        instanceStore.stopSagaByName(`listen_${action}`);
      });
      this.actionListeners = null;
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
