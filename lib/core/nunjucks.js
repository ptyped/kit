/*
    Manages the config for Nunjucks, the template engine
 */
const Nunjucks = require("nunjucks")
const path = require('path');

const debug = require('debug')('pkit:nunjucks')
const { getFrontmatterDataFromTemplate } = require('./utils')
class NunjucksInstance {
    constructor(config, views, opts) {
        this.config = config
        this.views = views
        this.opts = opts

        this.configure()
        this.addGlobals()
    }

    configure() {
        const defaultOpts = {
            autoescape: true,
            noCache: true,
            watch: true,
        }
        const options = Object.assign(defaultOpts, this.opts)

        debug('NunjucksOpts: %o', options)

        this.nunjucks = Nunjucks.configure(this.views, options)
    }

    addGlobals() {
        debug('Adding nunjucks globals')

        this.nunjucks.addGlobal("getVars", function () {
            return this.getVariables();
        })
    }

    express(app) {
        const config = this.config
        const env = this.nunjucks

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
            const frontmatter = getFrontmatterDataFromTemplate(config, this.name)

            if (frontmatter.content) {
                debug("Loaded frontmatter for `%s`: %o", this.name, frontmatter.data)

                debug("Rendering %s", this.name)
                const data = Object.assign(opts, frontmatter.data)
                env.renderString(frontmatter.content, data, cb);
            } else {
                debug("No front matter found for %s", this.name)
                debug("Rendering %s", this.name)
                env.render(this.name, opts, cb)
            }
        };

        app.set('view', NunjucksView);
        app.set('nunjucksEnv', env);
        
        return env;
    }
}

module.exports = NunjucksInstance