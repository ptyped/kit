const config = require("./config");
const env = process.env.NODE_ENV;
const utils = require("./utils");
const generator = require("./eleventy");
const generatorRoutes = require('./eleventyRoutes')
const server = require("./server");
const browserSync = require("browser-sync");

/**
 * Initialize project
 */
module.exports.init = async () => {
  await utils.copyFromTemplate(config);
}

/**
 * Starts development server environment
 */
module.exports.develop = async () => {
  try {
    const templates = await generator.watch(config);
    await module.exports.runServer(config, templates);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Starts production server environment
 */
module.exports.start = async () => {
  module.exports.develop()

  console.log("`start` is current aliased to `develop`")
}

/**
 * Builds generated server markup & assets
 */
module.exports.build = async () => {
  try {
    await generator.write(config);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Searches for an available port and starts the server
 */
module.exports.runServer = async (config, templates) => {
  const routes = generatorRoutes(config, templates)
  const app = server(config, routes);

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
};

if (require.main === module) {
  module.exports.develop();
}