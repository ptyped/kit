const config = require("./core/config");
const utils = require("./core/utils");
const { start } = require("./core/app");
const webpack = require("./core/webpack")

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
    const w = await webpack(appConfig).watch({
      'info-verbosity': 'info'
    }, (err, stats) => {
      if (err) throw err

      console.log(`\n${stats.toString({
        colors: true
      })}`)
    })
    await start(appConfig, routes);
  } catch (err) {
    console.error(err);
  }
};

