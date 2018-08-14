/*
    Handles creating an express application for handling sessions and
    routing
 */
const bodyParser = require("body-parser");
const browserSync = require("browser-sync");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const app = express();
const config = require("./config");
const env = process.env.NODE_ENV;
const middlewareAutoStoreData = require("./middleware/autoStoreData");
const middleware404 = require("./middleware/handle404");
const middlewareError = require("./middleware/handleError");
const middlewareStaticRoutes = require('./middleware/staticRoutes')
const middlewareStripHTMLExtensions = require("./middleware/stripHTMLExtensions")
const nunjucks = require("./nunjucks")
const pkg = require("../package.json");
const utils = require("./utils");

/**
 * Configure view engine(s)
 */
const nunjucksExpress = nunjucks.server(app)

nunjucksExpress.configure(config.dirs.views, {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
});

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
 * Enable app custom routing
 */
const appRoutes = require(utils.getFromApp("app/routes.js"));
const routes = require("./routes");

if (typeof routes === "function") {
  app.use("/", routes);
}

if (typeof appRoutes === "function") {
  app.use("/", appRoutes);
}

/**
 * Render any statically generated routes
 */
app.get(/^([^.]+)$/, middlewareStaticRoutes);

/**
 * Handle 404s
 */
app.use(middleware404);

/**
 * Display all errors
 */
app.use(middlewareError);

/**
 * Initialize the server with browserSync proxy
 */
utils.findAvailablePort(config.port, port => {
  const proxyPort = port - 10;

  if (env === "production") {
    app.listen(port);
  } else {
    app.listen(proxyPort, () => {
      browserSync({
        proxy: `localhost:${proxyPort}`,
        port: port,
        ui: false,
        files: [utils.getFromApp(config.dirs.output)],
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

module.exports = app;
