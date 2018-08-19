const path = require('path');
const matter = require('gray-matter');

module.exports = function express(config, env, app) {
  function NunjucksView(name, opts) {
    this.name = name;
    this.path = name;
    this.defaultEngine = opts.defaultEngine;
    this.ext = path.extname(name);
    if (!this.ext && !this.defaultEngine) {
      throw new Error('No default engine was specified and no extension was provided.');
    }
    if (!this.ext) {
      this.name += (this.ext = (this.defaultEngine[0] !== '.' ? '.' : '') + this.defaultEngine);
    }

    this.realPath = path.resolve(config.dirs.views, this.path);
  }

  NunjucksView.prototype.render = function render(opts, cb) {
    const frontmatter = matter.read(this.realPath)
    const data = Object.assign(opts, frontmatter.data)

    env.renderString(frontmatter.content, data, cb);
  };

  app.set('view', NunjucksView);
  app.set('nunjucksEnv', env);
  return env;
};