const Eleventy = require('@11ty/eleventy')
const path = require('path')

const config = require('./config')
const eleventyConfigPath = path.resolve(__dirname, 'eleventy.config.js')
const generator = new Eleventy(config.dirs.input, config.dirs.output)
let isVerbose = process.env.DEBUG ? false : true;

module.exports.watch = async () => {
    try {
        generator.setConfigPath(eleventyConfigPath)
        generator.setIsVerbose(isVerbose)
        await generator.init()
        await generator.watch()
    } catch (err) {
        if (err) throw err
    }
}

module.exports.build = async () => {
    try {
        generator.setConfigPath(eleventyConfigPath)
        generator.setIsVerbose(isVerbose)
        await generator.init()
        await generator.write()
    } catch (err) {
        if (err) throw err
    }
}