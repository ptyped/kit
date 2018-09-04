const dependency = require('./dependency');
const fs = require('fs');
const { getFromProject, npmInstall } = require('./utils');
const glob = require('glob');
const ncp = require('ncp');
const path = require('path');

const debug = require('debug')('pkit:template');

class Template {
  constructor(config) {
    this.config = config;
    this.getFromProject = getFromProject(this.config);
    this.projectPath = this.getFromProject('.');
    this.template = config.get('template');
  }

  async getDependency() {
    debug('Creating dependency for `%s`:', this.template);
    this.dependency = await dependency.create(this.config, this.template);
  }

  createProject() {
    return new Promise((resolve, reject) => {
      let projectPkg = {};
      const projectPkgPath = path.resolve(this.projectPath, 'package.json');
      const name = path.basename(this.projectPath);

      if (!fs.existsSync(this.projectPath)) {
        debug('Creating project directory: %s', this.projectPath);
        fs.mkdirSync(this.projectPath);
      }

      if (!fs.existsSync(projectPkgPath)) {
        projectPkg = {
          name: name,
          version: '0.1.0',
          private: true,
          dependencies: {},
          scripts: {}
        };

        debug('Writing `package.json` to: %s', projectPkgPath);
        fs.writeFileSync(projectPkgPath, JSON.stringify(projectPkg));
      }

      resolve();
    });
  }

  copy() {
    return new Promise((resolve, reject) => {
      const nodeModules = this.getFromProject('node_modules');
      const templatePath = path.resolve(nodeModules, this.dependency.name);
      const templateSrcPath = path.resolve(templatePath, 'src');
      const templateFiles = glob
        .sync(templateSrcPath + '/**/*')
        .filter(file => fs.lstatSync(file).isDirectory());

      if (fs.existsSync(templatePath)) {
        if (!fs.existsSync(this.projectPath)) {
          debug('Copying template to project at: %s', this.projectPath);
          ncp(templatePathSrc, this.projectPath);
        } else {
          templateFiles.forEach(file => {
            const filePath = file.slice(templateSrcPath.length);
            const appPath = path.join(this.projectPath, filePath);

            if (!fs.existsSync(appPath)) {
              debug('Copying template `%s` to project at: %s', file, appPath);
              ncp(file, appPath);
            }
          });
        }
      }

      resolve();
    });
  }

  configurePackageJson() {
    const projectPkgPath = path.resolve(this.projectPath, 'package.json');
    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath));

    if (!projectPkg.scripts) {
      projectPkg.scripts = {};
    }

    if (!projectPkg.pkit) {
      projectPkg.pkit = {};
    }

    projectPkg.scripts.start = 'pkit start';
    projectPkg.scripts.build = 'pkit build';
    projectPkg.scripts.update = 'pkit update';
    projectPkg.scripts.init = 'pkit init';

    if (!projectPkg.pkit.template) {
      projectPkg.pkit.template = this.dependency.input;
    }
  }

  async install() {
    try {
      debug(
        'Installing project dependencies: %s, %s',
        this.config.get('kitModule'),
        this.dependency.input
      );
      await npmInstall([this.config.get('kitModule'), this.dependency.input], {
        ignoreYarn: true,
        cwd: this.config.get('cwd')
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Template;
