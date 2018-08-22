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

const Nunjucks = require("./nunjucks")
const ProjectRoutes = require('./projectRoutes')

const middlewareAutoStoreData = require("./middleware/autoStoreData");
const middlewareDataFiles = require("./middleware/dataFiles");
const middleware404 = require("./middleware/handle404");
const middlewareError = require("./middleware/handleError");
const middlewareRoutesStatic = require('./middleware/routesStatic')
const middlewareStripHTMLExtensions = require("./middleware/stripHTMLExtensions")
const pkg = require("../../package.json");
const { findAvailablePort } = require("./utils");

class App {
  constructor(config, routes) {
    this.config = config
    this.routes = routes
    this.app = express()

    this.use(bodyParser.json())
    this.use(bodyParser.urlencoded({
      extended: true
    }))
    this.use(middlewareDataFiles(this.config))

    this.configureViewEngines()
    this.configureStaticFiles()
    this.configureSessions()
    this.configureRoutes()
  }

  use(pattern, middleware) {
    if (typeof pattern === "function") {
      this.app.use(pattern)
    } else {
      this.app.use(pattern, middleware)
    }
  }

  configureViewEngines() {
    const kitViews = path.resolve(__dirname, "../views")
    let views = [
      this.config.get('dirs.views'),
      kitViews
    ]

    if (this.config.templateDep) {
      const templateViews = path.resolve(this.getFromProject('node_modules'), this.config.templateDep.name, 'views')

      views = views.splice(1, 0, templateViews)
    }

    const nunjucks = new Nunjucks(this.config, views)

    nunjucks.express(this.app)
    this.app.set("view engine", "html");
  }

  configureSessions() {
    this.use(
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

    // Redirect all POST request to GET, to allow 
    // handling of application storage
    this.app.post(/^\/([^.]+)$/, (req, res) => {
      res.redirect("/" + req.params[0]);
    });

    this.use(middlewareAutoStoreData(this.config))
  }

  configureStaticFiles() {
    this.use('/public', express.static(path.resolve(__dirname, "../../dependencies")))
    this.use('/public', express.static(this.config.get('dirs.static')))
  }

  configureRoutes() {
    this.app.get(/\.html?$/i, middlewareStripHTMLExtensions)
    this.configureAppRoutes()
    this.configureProjectRoutes()
    this.configureCustomRoutes()
    this.app.get('*', middlewareRoutesStatic(this.config))
    this.use(middleware404);
    this.use(middlewareError)
  }

  configureAppRoutes() {
    const kitRoutes = require("../views/routes");

    if (typeof kitRoutes === "function") {
      this.use("/", kitRoutes);
    }
  }

  configureProjectRoutes() {
    const projectRoutes = new ProjectRoutes(this.config)

    // TODO: add static routes
    // projectRoutes.addStaticRoutes(this.app)
    projectRoutes.addDynamicRoutes(this.app)
  }

  configureCustomRoutes() {
    if (typeof this.routes === "function") {
      this.use(this.routes)
    }
  }

  async start() {
    const port = this.config.get('port')
    const opts = {
      verbose: this.config.get('verbose')
    }

    findAvailablePort(port, opts, port => {
      const proxyPort = port - 10;

      if (this.config.get('env') === "production") {
        this.app.listen(port);
      } else {
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
            logLevel: "error"
          });
        });
      }

      console.log(
        "\nNOTICE: the kit is for building prototypes, do not use it for production services."
      );
      console.log(`\nListening on port ${port} at http://localhost:${port}\n`);
    });
  }
}

module.exports = App