import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from '../redux/init';
import createRoutes from '../routes';
import { Router, match, useRouterHistory } from 'react-router';
import { fetchComponentData, deserializeJavascript } from '../helpers/redux';
import { extendLocation } from '../helpers/location';
import { Provider } from 'react-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createHistory from 'history/lib/createBrowserHistory';

// check unnecessary re-renders
if (__DEV__) {
  require('why-did-you-update').default(React, { exclude: /^(Root|withRouter|Connect|RouterTransition|AddDocument|ReduxForm)/ });
}

const apiPath = `${window.__PROJECT_PATH__}${window.__API_PATH__}`;
const projectPath = window.__PROJECT_PATH__;
const initialState = window.__INITIAL_STATE__;
const target = document.getElementById('root');

// Configure history for react-router
const history = useRouterHistory(useScroll(createHistory))({
  basename: projectPath,
});

// calling `match` is simply for side effects of
// loading route/component code for the initial location
let instanceStore = configureStore();
const createRoutesParams = {
  instanceStore,
  apiPath,
  projectPath,
};

match({ routes: createRoutes(createRoutesParams), history }, () => {
  // Recreate store with initial state from server
  instanceStore = configureStore(deserializeJavascript(initialState), instanceStore.getReducers());
  createRoutesParams.instanceStore = instanceStore;
  // Extended object location with redirect methods
  const createElement = (Component, props) => {
    // Asynchronously fetch data
    fetchComponentData({
      history,
      location: props.location, // eslint-disable-line react/prop-types
      basename: projectPath,
      dispatch: instanceStore.store.dispatch,
      components: [Component],
      apiPath,
      params: {
        urlParams: props.params, // eslint-disable-line react/prop-types
        urlQuery: props.location.query, // eslint-disable-line react/prop-types
      },
    }).catch(err1 => {
      if (!__PROD__) {
        window.console.log(err1);
      }
    });

    props.location = extendLocation(props.location); // eslint-disable-line react/prop-types
    props.location.basename = props.location.basename || ''; // eslint-disable-line react/prop-types
    return (
      <Component
        {...props}
      />
    );
  };

  // Create router (map routes)
  const routerInst = (
    <Router history={history} createElement={createElement}>
      {createRoutes(createRoutesParams)}
    </Router>
  );

  const node = (
    <Provider store={instanceStore.store}>
      {routerInst}
    </Provider>
  );

  ReactDOM.render(node, target);

  if (__DEBUG__ && !window.devToolsExtension) {
    // Enable Redux dev tools in DEBUG mode
    const DevToolsView = require('../components/DevToolsView').default;
    const devNode = (
      <Provider store={instanceStore.store}>
        <DevToolsView/>
      </Provider>
    );
    const devTarget = document.createElement('div');
    target.parentNode.insertBefore(devTarget, target.nextSibling);
    ReactDOM.render(devNode, devTarget);
  }
});
