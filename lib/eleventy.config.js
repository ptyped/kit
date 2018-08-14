/*
    Manages the configuration for Eleventy, the static site generator
*/
const config = require('./lib/config')
const nunjucks = require('./lib/nunjucks').static()
const path = require('path')

console.log(path.resolve(config.dirs.input, config.dirs.data))

module.exports = (eleventyConfig) => {
    const nunjucksEnvironment = nunjucks.Environment(
        new nunjucks.FileSystemLoader(config.dirs.views)
    )

    eleventyConfig.setLibrary('njk', nunjucksEnvironment)

    return {
        dir: {
            input: config.dirs.input,
            output: config.dirs.output,
            data: path.relative(config.dirs.input, config.dirs.data),
            includes: path.relative(config.dirs.input, config.dirs.includes)
        }
    }
}