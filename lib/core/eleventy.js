const Eleventy = require('@11ty/eleventy')
const path = require('path')
const pkg = require(path.resolve(__dirname, "../../package.json"))

const eleventyConfigPath = path.join('node_modules', pkg.name, 'lib/core/eleventy.config.js')
let isVerbose = process.env.DEBUG ? false : true;

module.exports.watch = async (config) => {
    try {
        const generator = await initGenerator(config)
        await generator.watch()

        return generator.writer.templateMap.map
    } catch (err) {
        if (err) throw err
    }
}

module.exports.build = async (config) => {
    try {
        const generator = await initGenerator(config)
        await generator.write()

        return generator.writer.templateMap.map
    } catch (err) {
        if (err) throw err
    }
}

const initGenerator = async (config) => {
    try {
        const generator = new Eleventy(config.dirs.input, config.dirs.output)
        await generator.setConfigPath(eleventyConfigPath)
        await generator.setIsVerbose(isVerbose)
        await generator.init()
        
        return generator
    } catch (err) {
        if (err) throw err
    }
}