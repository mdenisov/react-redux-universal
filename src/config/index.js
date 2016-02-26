let config = {};

if (__CLIENT__) {
  config = {
    projectPath: window.__PROJECT_PATH__,
    apiPath: `${window.__PROJECT_PATH__}${__API_PATH__}`,
  };
} else {
  config = {
    projectPath: process.env.PROJECT_PATH,
    apiPath: `http://${process.env.NODE_HOST}:${process.env.NODE_PORT}${process.env.PROJECT_PATH}${__API_PATH__}`,
  };
}

export default config;
