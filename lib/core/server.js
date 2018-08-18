/*
    Handles creating an express application for handling sessions and
    routing
 */
const bodyParser = require("body-parser");
const crypto = require("crypto");
const express = require("express");
const path = require('path')
const session = require("express-session");

const app = express();
const middlewareAutoStoreData = require("../middleware/autoStoreData");
const middleware404 = require("../middleware/handle404");
const middlewareError = require("../middleware/handleError");
const middlewareRoutesStatic = require('../middleware/routesStatic')
const middlewareStripHTMLExtensions = require("../middleware/stripHTMLExtensions")
const nunjucks = require("./nunjucks")
const pkg = require("../../package.json");
const utils = require("./utils");

module.exports = (config, routes) => {

  /**
   * Configure view engine(s)
   */
  const nunjucksExpress = nunjucks.server(config.dirs.views, app)

  app.set("view engine", "html");

  /**
   * Strip HTML extensions
   */
  app.get(/\.html?$/i, middlewareStripHTMLExtensions);

  /**
   * Redirect all POST request to GET, to allow handling
   * of application storage
   */
  app.post(/^\/([^.]+)$/, (req, res) => {
    res.redirect("/" + req.params[0]);
  });

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
   * Enable parsing req, res bodies
   */
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

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
  const baseDir = utils.getFromApp(config.dirs.input)
  const routesPaths = utils.getAppRoutes(baseDir)

  routesPaths.forEach(file => {
      const routes = require(file)
      const routesDir = path.dirname(file)
      const routesBase = routesDir.slice(baseDir.length)
      const routesPath = routesBase.length > 0 ? routesBase : "/"

      if (typeof routes === "function") {
          app.use(routesPath, routes)
      }
  })

  /**
   * Add passed-in routes
   */
  if (typeof routes === "function") {
    app.use(routes)
  }

  /**
   * Render any statically generated routes
   */
  app.get(/^([^.]+)$/, middlewareRoutesStatic);

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
