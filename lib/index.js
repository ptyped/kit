const config = require("./core/config");
const utils = require("./core/utils");
const { start } = require("./core/app");

/**
 * Initialize project
 */
module.exports.init = async (localConfig) => {
  const appConfig = config(localConfig)
  await utils.copyFromTemplate(appConfig);
}

/**
 * Starts development server environment
 */
module.exports.start = async (localConfig, routes) => {
  try {
    const appConfig = config(localConfig, routes)
    await start(appConfig, routes);
  } catch (err) {
    console.error(err);
  }
};

