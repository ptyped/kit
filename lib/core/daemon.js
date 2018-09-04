const pm2 = require('pm2');
const path = require('path');

const config = require('./config');
const { getFromApp } = require('./utils');

class Daemon {
  constructor(config, name) {
    this.config = config;
    this.name = name;

    this.configure();
  }

  connect() {
    return new Promise((resolve, reject) => {
      pm2.connect(err => {
        if (err) reject(err);

        resolve();
      });
    });
  }

  configure() {
    const env = this.config.get('env');
    const defaultOpts = {
      name: this.name,
      script: path.resolve(__dirname, '../server.js'),
      log: getFromApp(`${this.name}.log`),
      autorestart: true
    };
    const productionOpts = {};
    const developmentOpts = {};

    this.opts = Object.assign(
      defaultOpts,
      env === 'production' ? productionOpts : developmentOpts
    );
  }

  async start() {
    try {
      const startHandler = (err, apps) => {
        if (err) throw err;

        apps.forEach(app => {
          console.log(`Successfully started ${this.name}`);
        });
        process.exit(0);
      };

      await this.connect();
      pm2.start(this.opts, startHandler);
    } catch (err) {
      process.exit(2);
    }
  }

  stop() {
    try {
      pm2.stop(this.name, err => {
        if (err) throw err;

        process.exit(0);
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Daemon;
