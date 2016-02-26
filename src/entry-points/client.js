import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from '../redux/init';
import { useBasename } from 'history';
import useQuerys from 'history/lib/useQueries';
import createRoutes from '../routes';
import { Router, match } from 'react-router';
import { fetchComponentData, extendLocation, deserializeJavascript } from '../helpers/redux';
import es6Promise from 'es6-promise';
import { Provider } from 'react-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createHistory from 'history/lib/createBrowserHistory';

// Global Promises polyfill for whatwg-fetch
es6Promise.polyfill();

const target = document.getElementById('root');
const history = useQuerys(useBasename(useScroll(createHistory)))({
  basename: window.__PROJECT_PATH__,
});
const requestUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
let instanceStore = configureStore();

// calling `match` is simply for side effects of
// loading route/component code for the initial location
match({ routes: createRoutes(instanceStore), location: requestUrl, basename: window.__PROJECT_PATH__ }, () => {
  // Recreate store with initial state from server
  instanceStore = configureStore(deserializeJavascript(window.__INITIAL_STATE__), instanceStore.getReducers());
  // Extended object location with redirect methods
  const createElement = (Component, props) => {
    // Asynchronously fetch data
    fetchComponentData({
      dispatch: instanceStore.store.dispatch,
      components: [Component],
      params: Object.assign({}, props.params), // eslint-disable-line react/prop-types
      location: props.location, // eslint-disable-line react/prop-types
      history,
    }).catch(err1 => {
      if (!__PROD__) {
        window.console.log(err1);
      }
    });

    props.location = extendLocation(props.location); // eslint-disable-line react/prop-types
    return <Component {...props}/>;
  };

  // Create router (map routes)
  const routerInst = (
    <Router history={history} createElement={createElement}>
      {createRoutes(instanceStore)}
    </Router>
  );

  let node;
  if (__DEBUG__ && !window.devToolsExtension) {
    const DevToolsView = require('../components/DevToolsView').default;
    // Enable Redux dev tools in DEBUG mode
    node = (
      <Provider store={instanceStore.store}>
        <div>
          {routerInst}
          <DevToolsView/>
        </div>
      </Provider>
    );
  } else {
    node = (
      <Provider store={instanceStore.store}>
        {routerInst}
      </Provider>
    );
  }
  ReactDOM.render(node, target);
});
