import { IndexRoute, Route } from 'react-router';
import React from 'react';
import createRootComponent from '../helpers/createRootComponent';
import routerTransition from '../redux/modules/router/transition';

export default ({ instanceStore }) => {
  const Root = createRootComponent();
  instanceStore.registerReducer({ routerTransition });
  return (
    <Route path="/" component={Root}>
      <IndexRoute
        getComponent = {
          (location, callback) => {
            require.ensure([], (require) => {
              instanceStore.registerReducer({ documents: require(`../redux/modules/documents/reducer`).default });
              if (__HMR__ && module.hot) {// Hot reloading reducer
                module.hot.accept(`../redux/modules/documents/reducer`, () => {
                  instanceStore.registerReducer({ documents: require(`../redux/modules/documents/reducer`).default });
                });
              }

              callback(null, require('../containers/DocumentsList').default);
            });
          }
        }
      />
      <Route
        path="addDocument"
        getComponent = {
          (location, callback) => {
            require.ensure([], (require) => {
              instanceStore.registerReducer({ form: require(`redux-form`).reducer });
              callback(null, require('../containers/AddDocument').default);
            });
          }
        }
      />
      <Route
        path="documentInfo"
        getComponent = {
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
