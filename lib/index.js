const config = require("./core/config");
const utils = require("./core/utils");
const { start } = require("./core/app");

/**
 * Initialize project
 */
module.exports.init = async (localConfig = {}, template) => {
  const appConfig = config(localConfig)
  await utils.copyFromTemplate(template);
}

/**
 * Starts development server environment
 */
module.exports.start = async (localConfig = {}, routes) => {
  try {
    const appConfig = config(localConfig, routes)
    await start(appConfig, routes);
  } catch (err) {
    console.error(err);
  }
};

