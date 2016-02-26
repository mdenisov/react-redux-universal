import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';
import { RoutingContext } from 'react-router';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import { useBasename } from 'history';
import useQuerys from 'history/lib/useQueries';
import config from '../../../config';

const paths = config.get('utils_paths');
const { fetchComponentData } = require(paths.dist('server'));
const globals = config.get('globals');

// ------------------------------------
// Rendering Setup
// ------------------------------------
// TODO: there's a cleaner way to do this. The reason we're using the
// compiled .html file is so that we don't have to worry about query strings
// on generated assets, and we maintain a consistent index.html file between
// client-side development w/ webpack-dev-server and server rendering.
const getTemplate = (() => {
  const renderTemplate = () => {
    return fs.readFileSync(paths.public(`client/index.html`), 'utf-8')
      .replace(
        '<title>Empty page</title>',
        '${title}'
      )
      .replace(
        '<div id="root"></div>', [
          '<div id="root">${content}</div>',
          '<script>window.__INITIAL_STATE__=${initialState};window.__PROJECT_PATH__=\'${projectPath}\';window.__CURRENT_REDUCERS__=${currentReducers};</script>',
        ].join('')
      );
  };
  if (globals.__PROD__) {
    const renderedTemplate = renderTemplate();
    return () => renderedTemplate;
  }
  return () => renderTemplate();
})();

// TODO: should probably use a tagged template
const renderIntoTemplate = (template, content, instanceStore, title) => {
  return template
    .replace('${title}', title.toString())
    .replace('${content}', content)
    .replace('${initialState}', serialize(instanceStore.store.getState()))
    .replace(/\$\{projectPath\}/g, config.get('project_public_path'))
    .replace('${currentReducers}', serialize(Object.keys(instanceStore.getReducers())));
};

// Middleware render page
export default function* ({ instanceStore, renderProps, componentProps }) {
  renderProps.location.basename = config.get('project_public_path');

  yield fetchComponentData({
    dispatch: instanceStore.store.dispatch,
    components: renderProps.components,
    params: Object.assign({}, renderProps.params),
    location: renderProps.location,
  });

  const history = useQuerys(useBasename(createMemoryHistory))({
    basename: config.get('project_public_path'),
  });
  const createElement = (Component, props) => {
    return <Component {...props} {...componentProps}/>;
  };
  const node = (
    <Provider store={instanceStore.store}>
      <RoutingContext {...renderProps} createElement={createElement} history={history}/>
    </Provider>
  );

  const markup = ReactDOM.renderToString(node);
  const head = Helmet.rewind();
  this.body = renderIntoTemplate(getTemplate(), markup, instanceStore, head.title);
}
