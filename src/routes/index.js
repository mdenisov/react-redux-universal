import { IndexRoute, Route } from 'react-router';
import React, { PropTypes } from 'react';
import createRootComponent from '../helpers/createRootComponent';
import routerTransition from '../components/PageLoadProgressBar/reducer';

export default (params) => {
  const { instanceStore } = params;
  const Root = createRootComponent({
    childContextTypes: {
      apiPath: PropTypes.string.isRequired,
      fullApiPath: PropTypes.string.isRequired,
      instanceStore: PropTypes.object.isRequired,
      projectPath: PropTypes.string.isRequired,
    },
    childContext: {
      fullApiPath: params.fullApiPath,
      apiPath: params.apiPath,
      instanceStore: params.instanceStore,
      projectPath: params.projectPath,
    },
  });
  instanceStore.registerReducer({ routerTransition });
  return (
    <Route path="/" component={Root}>
      <IndexRoute
        getComponent={
          (location, callback) => {
            require.ensure([], (require) => {
              instanceStore.registerReducer(
                require('../redux/modules/reducer').default,
              ); // eslint-disable-line

              callback(null, require('../containers/DocumentsList').default);
            });
          }
        }
      />
      <Route
        path="addDocument"
        getComponent={
          (location, callback) => {
            require.ensure([], (require) => {
              instanceStore.registerReducer({ form: require('redux-form').reducer });
              callback(null, require('../containers/AddDocument').default);
            });
          }
        }
      />
      <Route
        path="documentInfo"
        getComponent={
          (location, callback) => {
            require.ensure([], (require) => {
              callback(null, require('../containers/DocumentInfo').default);
            });
          }
        }
      />
    </Route>
  );
};
