const path = require('path')
const remove = require('rimraf')

const App = require("./core/app");
const Config = require("./core/config");
const Template = require('./core/template');

const dependency = require('./core/dependency')
const javascript = require("./core/javascript")
const stylesheets = require('./core/stylesheets')
const utils = require("./core/utils");

process.on('unhandledRejection', err => {
  throw err;
});

/**
 * Initialize project
 * 
 * @param {*} userConfig
 * @param {*} template
 */
module.exports.init = async (userConfig, dir) => {
  try {
    const configInstance = new Config(userConfig, dir)
    const config = configInstance.config
    const dependencies = config.get('dependencies')
    const template = new Template(config, dir)

    // Clear deps
    const globPattern = path.join(path.resolve(__dirname, "../dependencies"), "/**/*")
    remove.sync(globPattern)

    // Download deps
    dependencies.forEach(async dep => {
      try {
        await dependency.get(config, dep)
      } catch (err) {
        throw err
      }
    })    

    await template.getDependency()
    await template.createProject()
    await template.install()
    await template.copy()
  } catch (err) {
    console.log(err)
  }
}

/**
 * Builds css once
 * 
 * @param {*} userConfig
 */
module.exports.buildStylesheets = async (userConfig) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    await stylesheets.sass(config)
    await stylesheets.postcss(config)
  } catch (err) {
    console.log(err)
  }
}

/**
 * Watches stylesheets for changes and rebuilds
 */
module.exports.watchStylesheets = async (userConfig) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    await stylesheets.sass(config, true)
    await stylesheets.postcss(config, true)
  } catch (err) {
    console.log(err)
  }
}

/**
 * Builds javascript once
 * 
 * @param {*} userConfig
 */
module.exports.buildJavascript = async (userConfig) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    const js = () => new Promise((resolve, reject) => {
      javascript(config).run((err, stats) => {
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
 * @param {*} userConfig 
 */
module.exports.watchJavascript = async (userConfig) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    const js = () => new Promise((resolve, reject) => {
      javascript(config).watch({
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
 * @param {*} userConfig
 */
module.exports.build = async (userConfig) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    module.exports.buildJavascript(config.getProperties())
    module.exports.buildStylesheets(config.getProperties())
  } catch (err) {
    console.error(err);
  }
};

/**
 * Starts development server environment
 * 
 * @param {*} userConfig
 * @param {*} routes
 */
module.exports.start = async (userConfig, routes) => {
  try {
    const configInstance = new Config(userConfig)
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    const app = new App(config, routes)

    await module.exports.watchStylesheets(config.getProperties())
    await module.exports.watchJavascript(config.getProperties())
    await app.start();
  } catch (err) {
    console.error(err);
  }
};
