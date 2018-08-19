const path = require('path');
const { getFrontmatterData } = require('./utils')

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
  }

  NunjucksView.prototype.render = function render(opts, cb) {
    const frontmatter = getFrontmatterData(config, this.name)

    console.log(frontmatter)

    if (frontmatter.content) {
        const data = Object.assign(opts, frontmatter.data)
        env.renderString(frontmatter.content, data, cb);
    } else {
        env.render(this.name, opts, cb)
    }
  };

  app.set('view', NunjucksView);
  app.set('nunjucksEnv', env);
  return env;
};