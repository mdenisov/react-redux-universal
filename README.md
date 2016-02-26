Example of the universal project on react, redux, koa, etc.
=======================

Table of Contents
-----------------
1. [Requirements](#requirements)
1. [Features](#features)
1. [Getting Started](#getting-started)
1. [Usage](#usage)
1. [Structure](#structure)
1. [Using Redux DevTools](#using-redux-devtools)

Requirements
------------

Node `^4.2.3`

Features
--------

* [React](https://github.com/facebook/react) (`^0.14.0`)
* [Redux](https://github.com/gaearon/redux) (`^3.0.0`)
  * react-redux (`^4.0.0`)
  * redux-devtools
  * redux-logger
  * redux-thunk middleware
* [react-router](https://github.com/rackt/react-router) (`^1.0.0`)
* [Webpack](https://github.com/webpack/webpack)
  * [CSS modules!](https://github.com/css-modules/css-modules)
  * postcss-loader for style autoprefixing
  * Pre-configured folder aliases and globals
  * Separate vendor-only bundle for common dependencies
  * CSS extraction during production builds
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [Koa](https://github.com/koajs/koa/)
* [Babel](https://github.com/babel/babel) (`^6.3.0`)
  * `react-transform-hmr` for hot reloading
  * `react-transform-catch-errors` with `redbox-react` for more visible error reporting
* [ESLint](http://eslint.org)
  * Uses [Airbnb's ESLint config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) (with some softened rules)
* [whatwg-fetch](https://github.com/github/fetch)
* [node-fetch](https://github.com/bitinn/node-fetch)
* [scroll-behavior](https://github.com/rackt/scroll-behavior)
* [redux-form](https://github.com/erikras/redux-form)
* [redux-form-schema](https://github.com/Lighthouse-io/redux-form-schema)

Getting Started
---------------

Just clone the repo and install the necessary node modules:

```shell
$ git clone https://github.com/bystrobank/react-redux-universal.git
$ cd react-redux-universal
$ npm install                   # Install Node modules listed in ./package.json (may take a while the first time)
$ npm start                     # Compile and launch
```

Usage
-----

Before delving into the descriptions for each available npm script, here's a brief summary of the three which will most likely be your bread and butter:

* Doing live development with HMR (hot module reload)? 
  * Use `npm start`(`npm run watch`) to spin up the koa and webpack-dev-server (HMR) with redux-devtools. 
  * Use `npm run watch:logger` to spin up the koa and webpack-dev-server (HMR) with redux-logger.
* Doing live development without HMR? Use `npm run dev` to spin up the only koa server in watch mode.
* Compiling the application to disk? Use `npm run compile`.

Great, now that introductions have been made here's everything in full detail:

* `npm start`(`npm run watch`) - Spins up koa server to serve your app at `localhost:4000` and webpack-dev-server (HMR) at `localhost:3000`.
* `npm run compile` - Compiles the application to disk (`~/dist/server` and `~/public/client` by default).
* `npm run watch:logger` - Same as `npm start`, but uses redux-logger instead redux-devtools.
* `npm run dev` - Spins up the only koa server to serve your app at `localhost:4000`.
* `npm run lint` - Runs ESLint against your source code.

**NOTE:** Koa host and port defined by env variables `NODE_HOST` and `NODE_PORT` in `package.json`. `webpack-dev-server` is launched on the same host as koa.
Project path defined by env variable 'PROJECT_PATH' and empty by default (http://localhost:4000/PROJECT_PATH/root_route/...). 

Structure
---------

The folder structure provided is only meant to serve as a guide, it is by no means prescriptive. It is something that has worked very well for me and my team, but use only what makes sense to you.

```
.
├── bin                      # Build/Start scripts
├── build                    # All build-related configuration
│   └── webpack              # Environment-specific configuration files for webpack
├── config                   # Project configuration settings
├── dist                     # Compiled application (src) for server side rendering
├── public                   # Assets and compiled application (src) for client side rendering
├── server                   # Koa application
|   ├── helpers              # Helpers for API
|   ├── middleware           # Koa middleware
|   |   ├── api              # Available to application of API
|   |   ├── renderRoute      # Routes rendering
|   |   └── ...              # Other middlewares 
│   └── index.js             # Server application entry point
├── src                      # Application source code
│   ├── components           # Generic React Components (generally Dumb components)
│   ├── config               # Application configuration settings
│   ├── containers           # Smart components that provide context (e.g. Redux Provider), layouts and other HOC
│   ├── entry-points         # Server side and client side entry points in application
│   ├── helpers              # Helpers of application
│   ├── redux                # Reducers of application
│   ├── routes               # Application route definitions
│   └── index.html           # HTML template of application
├── .babelrc                 # Global babel settings
├── .editorconfig            # Editor config
├── .eslintignore            # The ignored objects for eslint
├── .eslintrc                # Global eslint settings
├── .gitignore               # The ignored objects for git
├── LICENSE.md               # License
├── README.md                # This text
├── package.json             # NPM settings
├── webpack.config-server.js # Settings for webpack of bundle of application for server side
└── webpack.config.js        # Settings for webpack of bundle of application for client side
    
    
```

Using Redux DevTools
---------
[Redux Devtools](https://github.com/gaearon/redux-devtools) are enabled by default in `npm start`(`npm run watch`) mode.

- <kbd>CTRL</kbd>+<kbd>H</kbd> Toggle DevTools Dock
- <kbd>CTRL</kbd>+<kbd>Q</kbd> Move DevTools Dock Position
- see [redux-devtools-dock-monitor](https://github.com/gaearon/redux-devtools-dock-monitor) for more detailed information.

If you have the 
[Redux DevTools chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) installed it will automatically be used on the client-side instead.

If you want to disable the dev tools use `npm run watch:logger` or `npm run dev` mode.
DevTools are not enabled during production.
