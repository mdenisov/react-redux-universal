/* eslint-disable global-require */
import React from 'react';
import ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router, match, useRouterHistory } from 'react-router';
import { Provider } from 'react-redux';
import { useScroll } from 'react-router-scroll';
import createHistory from 'history/lib/createBrowserHistory';
import configureStore from './redux/init';
import createRoutes from './routes';
import { deserializeJavascript } from './helpers/redux';

// check unnecessary re-renders
if (__DEV__) {
  // eslint-disable-next-line
  require('why-did-you-update').default(
    React,
    {
      exclude: new RegExp('^(withRouter|Connect|ReduxForm|withContext|pure|' +
        'onlyUpdateForKeys|AddDocument)'),
    }
  );
}

const apiPath = `${window.__PROJECT_PATH__}${window.__API_PATH__}`;
const projectPath = window.__PROJECT_PATH__;
const initialState = window.__INITIAL_STATE__;
const target = document.getElementById('root');

// Configure history for react-router
const history = useRouterHistory(createHistory)({
  basename: projectPath,
});

// calling `match` is simply for side effects of
// loading route/component code for the initial location
let instanceStore = configureStore();
const createRoutesParams = {
  instanceStore,
  apiPath,
  fullApiPath: apiPath,
  projectPath,
};

match({ routes: createRoutes(createRoutesParams), history }, () => {
  // Recreate store with initial state from server
  instanceStore = configureStore(instanceStore.getReducers(), deserializeJavascript(initialState));
  createRoutesParams.instanceStore = instanceStore;

  // Create router (map routes)
  const routerInst = (
    <Router history={history} render={applyRouterMiddleware(useScroll())}>
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
    // eslint-disable-next-line
    const DevToolsView = require('./components/DevToolsView').default;
    const devNode = (
      <Provider store={instanceStore.store}>
        <DevToolsView />
      </Provider>
    );
    const devTarget = document.createElement('div');
    target.parentNode.insertBefore(devTarget, target.nextSibling);
    ReactDOM.render(devNode, devTarget);
  }
});
