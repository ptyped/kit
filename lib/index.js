const path = require('path');
const remove = require('rimraf');

const App = require('./core/app');
const Config = require('./core/config');
const Template = require('./core/template');

const debug = require('debug')('pkit');
const dependency = require('./core/dependency');
const javascript = require('./core/javascript');
const stylesheets = require('./core/stylesheets');

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
    const configInstance = new Config(userConfig, dir);
    let config = configInstance.config;
    const template = new Template(config, dir);

    debug('Initializing project');
    if (config.get('verbose')) {
      console.log('Initializing project...')
    }

    await template.getDependency();
    await template.createProject();
    await template.install();
    await template.copy();
    await template.configurePackageJson();
    await configInstance.loadFromTemplateConfig();

    debug('Reloading config with project template config');
    config = configInstance.config;

    await module.exports.updateDependencies(config.getProperties(), dir, true);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Fetches dependencies
 */
module.exports.updateDependencies = async (userConfig, dir, shouldRemove) => {
  try {
    const configInstance = new Config(userConfig, dir);
    await configInstance.loadFromTemplateConfig();
    let config = configInstance.config;

    debug('Updating dependencies');
    if (config.get('verbose')) {
      console.log('Updating dependencies...')
    }

    const dependencies = config.get('dependencies');

    if (shouldRemove) {
      const globPattern = path.join(config.get('dirs.dependencies'), '/**/*');
      debug('Clearing old dependencies');
      remove.sync(globPattern);
      debug('Cleared old dependencies');
    }

    await dependencies.forEach(async dep => {
      try {
        await dependency.get(config, dep);
      } catch (err) {
        throw err;
      }
    });

    debug('Updated depenencies');
  } catch (err) {
    console.log(err);
  }
};

/**
 * Builds css once
 *
 * @param {*} userConfig
 */
module.exports.buildStylesheets = async userConfig => {
  try {
    debug('Building stylesheets');
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;

    debug('Building stylesheets');
    if (config.get('verbose')) {
      console.log('Building stylesheets...')
    }

    await stylesheets.sass(config);
    await stylesheets.postcss(config);
    debug('Stylesheets built');
  } catch (err) {
    console.log(err);
  }
};

/**
 * Watches stylesheets for changes and rebuilds
 */
module.exports.watchStylesheets = async userConfig => {
  try {
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;

    debug('Watching stylesheets');
    if (config.get('verbose')) {
      console.log('Watching stylesheets')
    }

    await stylesheets.sass(config, true);
    await stylesheets.postcss(config, true);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Builds javascript once
 *
 * @param {*} userConfig
 */
module.exports.buildJavascript = async userConfig => {
  try {
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;

    debug('Building javascript');
    if (config.get('verbose')) {
      console.log('Building javascript...')
    }

    const js = () =>
      new Promise((resolve, reject) => {
        javascript(config).run((err, stats) => {
          if (err) reject(err);

          resolve(stats);
        });
      });
    const jsStats = await js();

    if (jsStats && config.get('verbose')) {
      console.log(
        `\n${jsStats.toString({
          colors: true
        })}`
      );
    }

    debug('Javascript built');
  } catch (err) {
    console.log(err);
  }
};

/**
 * Watches javascript for changes and rebuilds
 *
 * @param {*} userConfig
 */
module.exports.watchJavascript = async userConfig => {
  try {
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;

    debug('Watching javascript');
    if (config.get('verbose')) {
      console.log('Watching javascript')
    }

    const js = () =>
      new Promise((resolve, reject) => {
        javascript(config).watch(
          {
            'info-verbosity': 'info'
          },
          (err, stats) => {
            if (err) reject(err);

            resolve(stats);
          }
        );
      });
    const jsStats = await js();

    if (jsStats && config.get('verbose')) {
      console.log(
        `\n${jsStats.toString({
          colors: true
        })}`
      );
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Builds all static assets without running server
 *
 * @param {*} userConfig
 */
module.exports.build = async userConfig => {
  try {
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;
    module.exports.buildJavascript(config.getProperties());
    module.exports.buildStylesheets(config.getProperties());
  } catch (err) {
    console.error(err);
  }
};

/**
 * Configures application for use
 **/
module.exports.app = async (userConfig, routes) => {
  try {
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;
    const app = new App(config, routes);

    return app;
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
    const configInstance = new Config(userConfig);
    await configInstance.loadFromTemplateConfig();
    const config = configInstance.config;
    const app = await module.exports.app(config.getProperties(), routes);

    debug('Starting kit');

    await module.exports.watchStylesheets(config.getProperties());
    await module.exports.watchJavascript(config.getProperties());
    await app.start();

    debug('Kit started');
  } catch (err) {
    console.error(err);
  }
};
