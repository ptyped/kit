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

  if (dependencyType === "DIRECT") {
    const ext = path.extname(name)

    if (ext === ".zip") {
      const nameRegex = new RegExp(/http[s]?:\/\/[a-zA-Z0-9\-\.].*?\/.*?\/(.*?)\/.*?$/)
      const matches = nameRegex.exec(dependencyPath)
      
      name = matches[1]
    } else {
      name = name.replace(ext, "")
    }

    if (!dependencyPath.startsWith('direct:')) {
      dependencyPath = 'direct:' + dependencyPath
    }
  }

  if (dependencyType === "FILE") {
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
      const ext = path.extname(dependency.input)
      const isGit = ext === ".git"

      return new Promise((resolve, reject) =>
        download(dependency.input, dependency.output, { direct: true, clone: isGit }, err => {
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
  const branchRegex = new RegExp(/#.*?$/)
  const githubShorthandRegex = new RegExp(
    /^[a-zA-Z0-9|\-|\_]*?\/[a-zA-Z0-9|\-|\_]*?/
  );
  const gitPrefixRegex = new RegExp(/^github:|bitbucket:|gitlab:/);
  const customGitPrefixRegex = new RegExp(/^http(s)?:\/\/[a-zA-Z\.\-]*?:/)
  const directRegex = new RegExp(/^direct:/)
  const localRegex = new RegExp(/^file:/);
  const webRegex = new RegExp(/^http?(s):/);
  const npmRegex = new RegExp(/^[a-zA-Z0-9\-]*?$|^@[a-zA-Z0-9]*?\/[a-zA-Z0-9\-]*?$/)
  const isGithubShorthand = githubShorthandRegex.exec(dependencyPath) !== null;
  const isGitPrefix = gitPrefixRegex.exec(dependencyPath) !== null;
  const isCustomGitPrefix = customGitPrefixRegex.exec(dependencyPath) !== null;
  const isWeb = webRegex.exec(dependencyPath) !== null;
  const isDirect = directRegex.exec(dependencyPath) !== null;
  const isLocal = localRegex.exec(dependencyPath) !== null;
  const isNpm = npmRegex.exec(dependencyPath) !== null;

  if (isGithubShorthand) {
    return 1;
  }

  if (isGitPrefix) {
    return 1;
  }

  if (isCustomGitPrefix) {
    return 1;
  }

  if (isWeb) {
    const ext = path.extname(dependencyPath)
    const isGit = ext === ".git" || branchRegex.exec(dependencyPath) !== null
    const isNotFile = ext === ""

    if (isGit || isNotFile) {
      return 2;
    }

    return 3;
  }

  if (isDirect) {
    return 2;
  }

  if (isLocal) {
    return 4;
  }

  if (isNpm) {
    return 0;
  }

  return -1;
};
