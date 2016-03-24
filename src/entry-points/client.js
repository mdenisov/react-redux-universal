import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from '../redux/init';
import createRoutes from '../routes';
import { Router, match, useRouterHistory } from 'react-router';
import { fetchComponentData, extendLocation, deserializeJavascript } from '../helpers/redux';
import es6Promise from 'es6-promise';
import { Provider } from 'react-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createHistory from 'history/lib/createBrowserHistory';

// Global Promises polyfill for whatwg-fetch
es6Promise.polyfill();

const target = document.getElementById('root');

// Configure history for react-router
const history = useRouterHistory(useScroll(createHistory))({
  basename: window.__PROJECT_PATH__,
});

const apiPath = `${window.__PROJECT_PATH__}${window.__API_PATH__}`;

// calling `match` is simply for side effects of
// loading route/component code for the initial location
let instanceStore = configureStore();
match({ routes: createRoutes(instanceStore), history }, () => {
  // Recreate store with initial state from server
  instanceStore = configureStore(deserializeJavascript(window.__INITIAL_STATE__), instanceStore.getReducers());
  // Extended object location with redirect methods
  const createElement = (Component, props) => {
    // Asynchronously fetch data
    fetchComponentData({
      history,
      location: props.location, // eslint-disable-line react/prop-types
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
    return (
      <Component
        {...props}
        apiPath={apiPath}
        instanceStore={instanceStore}
        projectPath={window.__PROJECT_PATH__}
      />
    );
  };

  // Create router (map routes)
  const routerInst = (
    <Router history={history} createElement={createElement}>
      {createRoutes(instanceStore)}
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
