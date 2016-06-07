import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';
import { RouterContext } from 'react-router';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import config from '../../../config';

const paths = config.get('utils_paths');
const globals = config.get('globals');

// ------------------------------------
// Rendering Setup
// ------------------------------------
// TODO: there's a cleaner way to do this. The reason we're using the
// compiled .html file is so that we don't have to worry about query strings
// on generated assets, and we maintain a consistent index.html file between
// client-side development w/ webpack-dev-server and server rendering.
const getTemplate = (() => {
  const renderTemplate = () =>
    fs.readFileSync(paths.public('client/index.html'), 'utf-8')
      .replace(
        '<title>Empty page</title>',
        '${title}'
      )
      .replace(
        '<div id="root"></div>', [
          '<div id="root">${content}</div>',
          '<script>',
          'window.__INITIAL_STATE__=${initialState};',
          'window.__PROJECT_PATH__=\'${projectPath}\';',
          'window.__API_PATH__=\'${apiPath}\';',
          '</script>',
        ].join('')
      );
  if (globals.__PROD__) {
    const renderedTemplate = renderTemplate();
    return () => renderedTemplate;
  }
  return () => renderTemplate();
})();

// TODO: should probably use a tagged template
const renderIntoTemplate = ({ template, content, instanceStore, title }) =>
  template
    .replace('${title}', title.toString())
    .replace('${content}', content)
    .replace('${initialState}', serialize(instanceStore.store.getState()))
    .replace(/\$\{projectPath\}/g, config.get('project_public_path'))
    .replace('${apiPath}', config.get('api_path'));

// Middleware render page
export default function* ({ instanceStore, renderProps, componentProps }) {
  const createElement = (Component, props) => (
    <Component
      {...props}
      {...componentProps}
    />
  );
  const node = (
    <Provider store={instanceStore.store}>
      <RouterContext {...renderProps} createElement={createElement} />
    </Provider>
  );

  // First rendering for starting sagas of fetch data
  let markup = ReactDOM.renderToString(node);

  // If launched sagas
  const launchedSagas = instanceStore.getLaunchedSagas();
  if (Object.keys(launchedSagas).length) {
    // Stop launched sagas
    instanceStore.stopSagas();

    // Wait termination all launched sagas
    yield Promise.all(Object.keys(launchedSagas).map(sagaName => {
      const task = launchedSagas[sagaName];
      if (!task.error() || task.isRunning()) {
        return task.done;
      }
      return Promise.resolve();
    }));

    // Rerender markup already with fetched data
    markup = ReactDOM.renderToString(node);
  }

  // console.log(instanceStore.launchedSagas);
  const head = Helmet.rewind();
  this.body = renderIntoTemplate({
    template: getTemplate(),
    content: markup,
    instanceStore,
    title: head.title,
  });
}
