/*
    Manages the configuration for Eleventy, the static site generator
*/
const config = require('./config')
const nunjucks = require('./nunjucks').static()
const path = require('path')

module.exports = (eleventyConfig) => {
    const nunjucksEnvironment = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(config.dirs.input)
    )

    eleventyConfig.setLibrary('njk', nunjucksEnvironment)

    return {
        dataTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dir: {
            input: config.dirs.input,
            output: config.dirs.output,
            data: path.relative(config.dirs.input, config.dirs.data),
            includes: path.relative(config.dirs.input, config.dirs.includes)
        }
    }
}