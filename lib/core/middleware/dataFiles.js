const glob = require('glob');
const merge = require('webpack-merge')
const path = require('path');

const acceptedExts = ['js', 'json', 'yaml', 'yml'];
const autoStoreData = require('./autoStoreData');
const { getFrontmatterDataFromData } = require('../utils');

module.exports = config => (req, res, next) => {
  addGlobalDataFiles(config, req, res);
  addLocalDataFiles(config, req, res);
  next();
};

const addGlobalDataFiles = (config, req, res) => {
  return new Promise((resolve, reject) => {
    let sessionFile
    const globPattern = path.join(
      config.get('dirs.data'),
      `**/*.{${acceptedExts.join(',')}}`
    );
    const dataFiles = glob.sync(globPattern).filter(file => {
      const ext = path.extname(file);
      const fileName = path.basename(file).replace(ext, '');
      const isSessionFile = fileName === 'session';
      const isDataFile = fileName === 'data';

      if (isSessionFile) {
        sessionFile = file
      }

      return !isSessionFile && !isDataFile;
    });

    dataFiles.forEach(file => {
      const fmt = getFrontmatterDataFromData(config, file);
      const fileName = path.basename(file);
      const ext = path.extname(fileName);
      const name = fileName.replace(ext, '');
      const data = {};

      data[name] = fmt.data;

      res.locals = merge(res.locals, data);
    });

    if (sessionFile) {
      autoStoreData(config, sessionFile)(req, res);
    }

    resolve()
  })
};

const addLocalDataFiles = (config, req, res) => {
  return new Promise((resolve, reject) => {
    const globPattern = path.join(
      config.get('dirs.views'),
      `**/data.{${acceptedExts.join(',')}}`
    );
    const dataFiles = glob.sync(globPattern);

    dataFiles.forEach(file => {
      const filePath = path.resolve(file);
      const fileRelPath = path.relative(config.get('dirs.views'), filePath);
      const fileRelDir = path.dirname(fileRelPath);
      const fmt = getFrontmatterDataFromData(config, file);

      if (fileRelDir === '.') {
        res.locals = merge(res.locals, fmt.data);
      } else if (req.path.indexOf(fileRelDir) > -1) {
        res.locals = merge(res.locals, fmt.data);
      }
    });

    resolve()
  })
};
