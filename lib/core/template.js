const dependency = require('./dependency');
const fs = require('fs-extra');
const { getFromProject, npmInstall } = require('./utils');
const glob = require('glob');
const path = require('path');

const debug = require('debug')('pkit:template');

class Template {
  constructor(config) {
    this.config = config;
    this.getFromProject = getFromProject(this.config);
    this.projectPath = this.getFromProject('.');
    this.template = this.config.get('template');
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
        fs.mkdirpSync(this.projectPath);
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

      for (var key in templateFiles) {
        const templateFilePath = templateFiles[key]
        const templateRelPath = path.normalize(templateFilePath.replace(templateSrcPath, "./"))
        const projectPath = path.resolve(this.projectPath, templateRelPath)
        const isDirectory = fs.lstatSync(templateFilePath).isDirectory()

        if (isDirectory) {
          fs.mkdirpSync(projectPath)
        } else {
          fs.copySync(templateFilePath, projectPath)
        }
      }

      resolve();
    });
  }

  configurePackageJson() {
    return new Promise((resolve, reject) => {
      const projectPkgPath = path.resolve(this.projectPath, 'package.json');
      const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath));

      if (!projectPkg.scripts) {
        projectPkg.scripts = {};
      }

      if (!projectPkg.pkit) {
        projectPkg.pkit = {};
      }

      if (!projectPkg.pkit.template) {
        projectPkg.pkit.template = this.dependency.input;
      }

      projectPkg.scripts.start = 'pkit start';
      projectPkg.scripts.build = 'pkit build';
      projectPkg.scripts.update = 'pkit update';
      projectPkg.scripts.init = 'pkit init';

      debug('Updating `package.json`: %s', projectPkgPath);
      fs.writeFileSync(projectPkgPath, JSON.stringify(projectPkg));
    })
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
        cwd: this.config.get('cwd'),
        verbose: this.config.get('verbose')
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Template;
