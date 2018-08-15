const config = require("./config");
const env = process.env.NODE_ENV;
const utils = require("./utils");
const generator = require("./eleventy");
const server = require("./server");
const browserSync = require("browser-sync");

module.exports.start = async () => {
  try {
    await utils.copyFromTemplate(config);
    await generator.watch(config);
    await module.exports.runServer(config);
  } catch (err) {
    console.error(err);
  }
};

module.exports.build = async () => {
  try {
    await module.exports.copyFromTemplate(config);
    await generator.watch(config);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Searches for an available port and starts the server
 */
module.exports.runServer = async (config) => {
  const app = server(config);

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
  module.exports.start();
}
