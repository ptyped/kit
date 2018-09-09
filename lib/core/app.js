/*
    Handles creating an express application for handling sessions and
    routing
 */
const bodyParser = require('body-parser');
const browserSync = require('browser-sync');
const express = require('express');
const minifyHtml = require('express-minify-html')
const path = require('path');
const serveIndex = require('serve-index');

const debug = require('debug')('pkit:app');
const { findAvailablePort, getFromProject } = require('./utils');
const middlewareDataFiles = require('./middleware/dataFiles');
const middleware404 = require('./middleware/handle404');
const middlewareError = require('./middleware/handleError');
const middlewarePersistentSession = require('./middleware/persistentSession');
const middlewareRoutesStatic = require('./middleware/routesStatic');
const middlewareStripHTMLExtensions = require('./middleware/stripHTMLExtensions');
const Nunjucks = require('./nunjucks');
const pkg = require('../../package.json');
const ProjectRoutes = require('./projectRoutes');

class App {
  constructor(config, routes) {
    this.config = config;
    this.routes = routes;
    this.getFromProject = getFromProject(config);
    this.app = express();

    this.use(bodyParser.json());
    this.use(
      bodyParser.urlencoded({
        extended: true
      })
    );

    this.configureViewEngines();
    this.configureStaticFiles();
    this.use(minifyHtml({
      override: true,
      exception_url: false,
      htmlMinifier: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          minifyJS: true
      }
    }))
    this.configureSessions();
    this.use(middlewareDataFiles(this.config));
    this.configureRoutes();
  }

  use(pattern, middleware) {
    if (typeof pattern === 'function') {
      this.app.use(pattern);
    } else {
      this.app.use(pattern, middleware);
    }
  }

  configureViewEngines() {
    const kitViews = path.resolve(
      this.getFromProject('node_modules'),
      pkg.name,
      'lib/views'
    );
    let views = [this.config.get('dirs.views'), kitViews];

    debug(`Using views %o`, views);

    if (this.config.templateDep) {
      const templateViews = path.resolve(
        this.getFromProject('node_modules'),
        this.config.templateDep.name,
        'views'
      );

      views = views.splice(1, 0, templateViews);
    }

    debug(`Added template views %o`, views);

    const nunjucks = new Nunjucks(this.config, views);

    nunjucks.express(this.app);
    this.app.set('view engine', 'html');
  }

  configureSessions() {
    this.use(middlewarePersistentSession(this.config));

    // Redirect all POST request to GET, to allow
    // handling of application storage
    this.app.post(/^\/([^.]+)$/, (req, res) => {
      res.redirect('/' + req.params[0]);
    });
  }

  configureStaticFiles() {
    const dependencyDir = this.config.get('dirs.dependencies');
    const staticDir = this.config.get('dirs.static');
    const publicPath = this.config.get('publicPath');

    this.use(
      publicPath,
      express.static(dependencyDir),
      serveIndex(dependencyDir, { icons: true })
    );
    this.use(
      publicPath,
      express.static(staticDir),
      serveIndex(staticDir, { icons: true })
    );

    debug(
      'Serving static files from `%s`, `%s` at: %s',
      dependencyDir,
      staticDir,
      publicPath
    );
  }

  configureRoutes() {
    this.app.get(/\.html?$/i, middlewareStripHTMLExtensions);
    this.configureAppRoutes();
    this.configureProjectRoutes();
    this.configureCustomRoutes();
    this.app.get('*', middlewareRoutesStatic(this.config));
    this.use(serveIndex(this.config.get('dirs.views'), { icons: true }));
    this.use(middleware404);
    this.use(middlewareError);
  }

  configureAppRoutes() {
    const kitRoutes = require('../views/routes');

    if (typeof kitRoutes === 'function') {
      this.use('/', kitRoutes);
      debug('Added kit routes');
    }
  }

  configureProjectRoutes() {
    const projectRoutes = new ProjectRoutes(this.config);

    // TODO: add static routes
    // projectRoutes.addStaticRoutes(this.app)
    projectRoutes.addDynamicRoutes(this.app);
    debug('Added project routes');
  }

  configureCustomRoutes() {
    if (typeof this.routes === 'function') {
      this.use(this.routes);
      debug('Added custom routes');
    }
  }

  async start() {
    const port = this.config.get('port');
    const opts = {
      verbose: this.config.get('verbose')
    };

    findAvailablePort(port, opts, port => {
      const proxyPort = port - 10;

      if (this.config.get('env') === 'production') {
        debug('Starting production server');
        this.app.listen(port);
      } else {
        debug('Starting development server');
        this.app.listen(proxyPort, () => {
          browserSync({
            proxy: `localhost:${proxyPort}`,
            port: port,
            ui: false,
            files: [
              this.config.get('dirs.input'),
              this.config.get('dirs.static')
            ],
            ghostmode: false,
            open: false,
            notify: false,
            logLevel: 'error'
          });
        });
      }

      console.log(
        '\nNOTICE: the kit is for building prototypes, do not use it for production services.'
      );
      console.log(`\nListening on port ${port} at http://localhost:${port}\n`);
    });
  }
}

module.exports = App;
