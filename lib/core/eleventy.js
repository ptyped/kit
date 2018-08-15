const Eleventy = require('@11ty/eleventy')
const path = require('path')

const eleventyConfigPath = path.resolve(__dirname, 'eleventy.config.js')
let isVerbose = process.env.DEBUG ? false : true;

module.exports.watch = async (config) => {
    try {
        const generator = new Eleventy(config.dirs.input, config.dirs.output)
        await generator.setConfigPath(eleventyConfigPath)
        await generator.setIsVerbose(isVerbose)
        await generator.init()
        await generator.watch()
        console.log(generator.data)
    } catch (err) {
        if (err) throw err
    }
}

module.exports.build = async (config) => {
    try {
        const generator = new Eleventy(config.dirs.input, config.dirs.output)
        await generator.setConfigPath(eleventyConfigPath)
        await generator.setIsVerbose(isVerbose)
        await generator.init()
        await generator.write()
        console.log(generator.data)
    } catch (err) {
        if (err) throw err
    }
}