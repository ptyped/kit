/*
    Handles creating an express application for handling sessions and
    routing
 */
const bodyParser = require('body-parser');
const browserSync = require('browser-sync');
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const appRoutes = require('./appRoutes')
const middlewareAutoStoreData = require("./middleware/autoStoreData");
const middleware404 = require("./middleware/handle404");
const middlewareError = require("./middleware/handleError");
const middlewareRoutesStatic = require('./middleware/routesStatic')
const middlewareStripHTMLExtensions = require("./middleware/stripHTMLExtensions")
const nunjucks = require("./nunjucks")
const pkg = require("../../package.json");
const { getFromApp, findAvailablePort } = require("./utils");

/**
 * The express application used to serve the prototype
 * 
 * @param {*} config 
 * @param {*} routes 
 */
module.exports.app = (config, routes) => {

  /**
   * Configure view engine(s)
   */
  const nunjucksEnv = nunjucks(config.dirs.views)

  nunjucksEnv.express(app)
  app.set("view engine", "html");

  /**
   * Strip HTML extensions
   */
  app.get(/\.html?$/i, middlewareStripHTMLExtensions);

  /**
   * Enable parsing req, res bodies
   */
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  /**
   * Enable application sessions
   */
  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 3 // 3 hours
      },
      name: `${pkg.name}${crypto.randomBytes(64).toString("hex")}`,
      secret: crypto.randomBytes(64).toString("hex"),
      resave: false,
      saveUninitialized: false
    })
  );

  /**
   * Enable static assets from public, etc
   */
  const public = getFromApp(config.dirs.public)

  app.use('/public', express.static(path.join(__dirname, '/public')))
  app.use('/assets', express.static('assets'))

  /**
   * Redirect all POST request to GET, to allow handling
   * of application storage
   */
  app.post(/^\/([^.]+)$/, (req, res) => {
    res.redirect("/" + req.params[0]);
  });

  /**
   * Automatically store posted data in session
   */
  app.use(middlewareAutoStoreData);

  /**
   * Add kit routes
   */
  const kitRoutes = require("../views/routes");

  if (typeof kitRoutes === "function") {
    app.use("/", kitRoutes);
  }

  /**
   * Add app routes
   */
  //appRoutes(config, app)

  /**
   * Add any custom routes passed in
   */

  if (typeof routes === "function") {
    app.use(routes)
  }

  /**
   * Render any statically generated routes
   */
  app.get('*', middlewareRoutesStatic(config));

  /**
   * Handle 404s
   */
  app.use(middleware404);

  /**
   * Display all errors
   */
  app.use(middlewareError);

  return app
}

/**
 * Searches for an available port and starts the server
 * 
 * @param {*} config 
 * @param {*} routes 
 */
module.exports.start = async (config, routes) => {
  const app = module.exports.app(config, routes);

  findAvailablePort(config.port, port => {
    const proxyPort = port - 10;

    if (config.env === "production") {
      app.listen(port);
    } else {
      app.listen(proxyPort, () => {
        browserSync({
          proxy: `localhost:${proxyPort}`,
          port: port,
          ui: false,
          files: [getFromApp(config.dirs.output)],
          ghostmode: false,
          open: false,
          notify: false,
          logLevel: "error"
        });
      });
    }

    console.log(
      "\nNOTICE: the kit is for building prototypes, do not use it for production services."
    );
    console.log(`Listening on port ${port} at http://localhost:${port}`);
  });
};