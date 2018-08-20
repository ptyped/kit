const config = require("./core/config");
const javascript = require("./core/javascript")
const { promisify } = require('util');
const { start } = require("./core/app");
const stylesheets = require('./core/stylesheets')
const utils = require("./core/utils");

/**
 * Initialize project
 * 
 * @param {*} localConfig
 * @param {*} template
 */
module.exports.init = async (localConfig, template) => {
  try {
    const appConfig = config(localConfig)
    await utils.copyFromTemplate(template);
  } catch (err) {
    console.log(err)
  }
}

/**
 * Builds css once
 * 
 * @param {*} localConfig
 */
module.exports.buildStylesheets = async (localConfig) => {
  try {
    const appConfig = config(localConfig)
    await stylesheets.sass(appConfig)
    await stylesheets.postcss(appConfig)
  } catch (err) {
    console.log(err)
  }
}

/**
 * Watches stylesheets for changes and rebuilds
 */
module.exports.watchStylesheets = async (localConfig) => {
  try {
    const appConfig = config(localConfig)
    await stylesheets.sass(appConfig, true)
    await stylesheets.postcss(appConfig, true)
  } catch (err) {
    console.log(err)
  }
}

/**
 * Builds javascript once
 * 
 * @param {*} localConfig
 */
module.exports.buildJavascript = async (localConfig) => {
  try {
    const appConfig = config(localConfig)
    const js = () => new Promise((resolve, reject) => {
      javascript(appConfig).run((err, stats) => {
        if (err) reject(err)

        resolve(stats)
      })
    })
    const jsStats = await js()

    if (jsStats) {
      console.log(`\n${jsStats.toString({
        colors: true
      })}`)
    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * Watches javascript for changes and rebuilds
 * 
 * @param {*} localConfig 
 */
module.exports.watchJavascript = async (localConfig) => {
  try {
    const appConfig = config(localConfig)
    const js = () => new Promise((resolve, reject) => {
      javascript(appConfig).watch({
        'info-verbosity': 'info'
      }, (err, stats) => {
        if (err) reject(err)

        resolve(stats)
      })
    })
    const jsStats = await js()

    if (jsStats) {
      console.log(`\n${jsStats.toString({
        colors: true
      })}`)
    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * Builds all static assets without running server
 * 
 * @param {*} localConfig
 */
module.exports.build = async (localConfig) => {
  try {
    const appConfig = config(localConfig)
    module.exports.buildJavascript()
    module.exports.buildStylesheets()
  } catch (err) {
    console.error(err);
  }
};

/**
 * Starts development server environment
 * 
 * @param {*} localConfig
 * @param {*} routes
 */
module.exports.start = async (localConfig, routes) => {
  try {
    const appConfig = config(localConfig, routes)
    await module.exports.watchStylesheets()
    await module.exports.watchJavascript()
    await start(appConfig, routes);
  } catch (err) {
    console.error(err);
  }
};
