const download = require('download-git-repo');
const fetch = require('node-fetch');
const fs = require('fs');
const mkdir = require('mkdirp');
const path = require('path');
const ncp = require('ncp');

const debug = require('debug')('pkit:dependency');
const dependencyTypes = ['GIT', 'DIRECT', 'WEB', 'FILE'];
let { getFromProject } = require('./utils');
const pkg = require('../../package.json');

/**
 * Fetches a dependency
 *
 * @param {*} config
 * @param {*} dependency
 * @param {*} dependecyPrefix
 */
module.exports.create = async (config, dependencyPath) => {
  const dependencyType = dependencyTypes[module.exports.resolveDependencyType(dependencyPath)];
  const dependenciesPath = config.get('dirs.dependencies');
  let name = path.basename(dependencyPath).replace(/([#].*?)$/, '');

  if (dependencyType === dependencyTypes[1]) {
    const ext = path.extname(name)

    name = name.replace(ext, "")
  }

  if (dependencyType === dependencyTypes[3]) {
    dependencyPath = path.resolve(
      getFromProject(config)('.'),
      dependencyPath.substr(5)
    );
  }

  const output = path.resolve(dependenciesPath, name);
  const dependency = {
    name: name,
    type: dependencyType,
    input: dependencyPath,
    output: output
  };

  debug('Resolved dependency `' + dependenciesPath + '` %o', dependency);

  return dependency;
};

module.exports.get = async (
  config,
  dependencyPathOrObject,
  dependencyPrefix
) => {
  let dependency;

  if (typeof dependencyPathOrObject === 'object') {
    dependency = await dependencyPathOrObject;
  } else {
    dependency = await module.exports.create(
      config,
      dependencyPathOrObject,
      dependencyPrefix
    );
  }

  try {
    debug(
      'Downloading dependency `' +
        dependency.input +
        '` to `' +
        dependency.output +
        '`'
    );

    if (!fs.existsSync(config.get('dirs.dependencies'))) {
      mkdir.sync(config.get('dirs.dependencies'));
    }

    if (dependency.type === dependencyTypes[0]) {
      return new Promise((resolve, reject) =>
        download(dependency.input, dependency.output, { clone: false }, err => {
          if (err) reject(err);

          debug('Downloaded dependency `' + dependency.input + '`');
          resolve(dependency.output);
        })
      );
    }

    if (dependency.type === dependencyTypes[1]) {
      return new Promise((resolve, reject) =>
        download(dependency.input, dependency.output, { direct: true }, err => {
          if (err) reject(err);

          debug('Downloaded dependency `' + dependency.input + '`');
          resolve(dependency.output);
        })
      );
    }

    if (dependency.type === dependencyTypes[2]) {
      const res = await fetch(dependency.input, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      const content = await res.text();

      fs.writeFileSync(dependency.output, content);

      debug('Downloaded dependency `' + dependency.input + '`');
      return dependency.output;
    }

    if (dependency.type === dependencyTypes[3]) {
      ncp(dependency.input, dependency.output);
      debug('Downloaded dependency `' + dependency.input + '`');
    }
  } catch (err) {
    throw err;
  }
};

module.exports.resolveDependencyType = dependencyPath => {
  const githubShorthandRegex = new RegExp(
    /^[a-zA-Z0-9|\-|\_]*?\/[a-zA-Z0-9|\-|\_]*?/
  );
  const gitPrefixRegex = new RegExp(/^github|bitbucket|gitlab/);
  const directRegex = new RegExp(/^direct/);
  const localRegex = new RegExp(/^file/);
  const webRegex = new RegExp(/^https|http/);

  const isGithubShorthand = githubShorthandRegex.exec(dependencyPath) !== null;

  if (isGithubShorthand) {
    return 0;
  }

  const gitPrefix = gitPrefixRegex.exec(dependencyPath);
  const isGitPrefix = gitPrefix !== null;

  if (isGitPrefix) {
    return 0;
  }

  const isDirect = directRegex.exec(dependencyPath) !== null;

  if (isDirect) {
    return 1;
  }

  const isWeb = webRegex.exec(dependencyPath) !== null;

  if (isWeb) {
    return 2;
  }

  const isLocal = localRegex.exec(dependencyPath) !== null;

  if (isLocal) {
    return 3;
  }

  return -1;
};
