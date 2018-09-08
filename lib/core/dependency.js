const download = require('download-git-repo');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

const debug = require('debug')('pkit:dependency');
const dependencyTypes = ['NPM', 'GIT', 'DIRECT', 'WEB', 'FILE'];
let { getFromProject } = require('./utils');

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

  if (dependencyType === dependencyTypes[0] && dependencyPath.startsWith('@')) {
    name = dependencyPath
  }

  if (dependencyType === dependencyTypes[2]) {
    const ext = path.extname(name)

    name = name.replace(ext, "")
  }

  if (dependencyType === dependencyTypes[4]) {
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
  dependencyPathOrObject
) => {
  let dependency;

  if (typeof dependencyPathOrObject === 'object') {
    dependency = await dependencyPathOrObject;
  } else {
    dependency = await module.exports.create(
      config,
      dependencyPathOrObject
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
      fs.mkdirpSync(config.get('dirs.dependencies'));
    }

    if (dependency.type === "GIT") {
      return new Promise((resolve, reject) =>
        download(dependency.input, dependency.output, { clone: false }, err => {
          if (err) reject(err);

          debug('Downloaded dependency `' + dependency.input + '`');
          resolve(dependency.output);
        })
      );
    }

    if (dependency.type === "DIRECT") {
      console.log(dependency.input, dependency.output)
      return new Promise((resolve, reject) =>
        download(dependency.input, dependency.output, { direct: true }, err => {
          if (err) reject(err);

          debug('Downloaded dependency `' + dependency.input + '`');
          resolve(dependency.output);
        })
      );
    }

    if (dependency.type === "WEB") {
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

    if (dependency.type === "FILE") {
      return new Promise((resolve, reject) => {
        const isDirectory = fs.lstatSync(dependency.input).isDirectory()

        try {
          if (isDirectory) {
            fs.mkdirpSync(dependency.output)
            resolve(fs.copySync(dependency.input, dependency.output))
          } else {
            const dir = path.dirname(dependency.output)
            fs.mkdirpSync(dir)
            resolve(fs.copyFileSync(dependency.input, dependency.output))
          }
        } catch(err) {
          reject(err)
        }
      })
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
  const npmRegex = new RegExp(/^[a-zA-Z0-9\-]*?$|^@[a-zA-Z0-9]*?\/[a-zA-Z0-9\-]*?$/)

  const isGithubShorthand = githubShorthandRegex.exec(dependencyPath) !== null;

  if (isGithubShorthand) {
    return 1;
  }

  const gitPrefix = gitPrefixRegex.exec(dependencyPath);
  const isGitPrefix = gitPrefix !== null;

  if (isGitPrefix) {
    return 1;
  }

  const isDirect = directRegex.exec(dependencyPath) !== null;

  if (isDirect) {
    return 2;
  }

  const isWeb = webRegex.exec(dependencyPath) !== null;

  if (isWeb) {
    return 3;
  }

  const isLocal = localRegex.exec(dependencyPath) !== null;

  if (isLocal) {
    return 4;
  }

  const isNpm = npmRegex.exec(dependencyPath) !== null;

  if (isNpm) {
    return 0;
  }

  return -1;
};
