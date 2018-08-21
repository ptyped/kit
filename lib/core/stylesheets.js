const chokidar = require('chokidar')
const cssImmutable = require('immutable-css')
const cssImport = require('postcss-import')
const cssNano = require('cssnano')
const cssNext = require('postcss-cssnext')
const fs = require('fs')
const glob = require('glob')
const laggard = require('laggard')
const merge = require('webpack-merge')
const path = require('path')
const postcss = require('postcss')
const postcssReporter = require('postcss-reporter')
const sass = require('node-sass')

module.exports.sass = async (config, watch) => {
    const globPattern = path.join(config.get('dirs.assets.scss'), "*.scss")
    const entryPoints = glob.sync(globPattern)

    if (watch) {
        chokidar.watch(globPattern, {ignoreInitial: true})
            .on('change', (path => processSassEntryPoint(config, e)))
    }

    entryPoints.forEach(e => processSassEntryPoint(config, e))
}

module.exports.postcss = async (config, watch) => {
    const globPattern = path.join(config.get('dirs.assets.css'), "*.css")
    const entryPoints = glob.sync(globPattern)

    if (watch) {
        chokidar.watch(globPattern, {ignoreInitial: true})
            .on('change', (path => processPostCssEntryPoint(config, e, false)))
    }

    entryPoints.forEach(e => processPostCssEntryPoint(config, e, false))
}

const processSassEntryPoint = async (config, entryPoint) => {
    const fileName = path.basename(entryPoint)
    const extName = path.extname(fileName)
    const name = fileName.replace(extName, "")
    const outFile = name + ".css"
    const outPath = path.resolve(config.get('dirs.static'), outFile)
    const defaultConfig = {
        file: entryPoint,
        outFile: outPath,
        sourceMap: true,
        outputStyle: 'expanded'
    }
    const sassConfig = merge(defaultConfig, config.get('configureSass'))
    const renderedSass = () => new Promise((resolve, reject) => {
        sass.render(sassConfig, (err, res) => {
            if (err) reject(err)

            fs.writeFile(outPath, res.css, err => reject(err))
            resolve(outPath)
        })
    })
    
    await renderedSass()
    await processPostCssEntryPoint(config, outPath, true)
}

const processPostCssEntryPoint = async (config, entryPoint, isAfterSass) => {
    const fileName = path.basename(entryPoint)
    const outPath = path.resolve(config.get('dirs.static'), fileName)
    const mapName = fileName.replace(".css", ".map.css")
    const outPathMap = path.resolve(config.get('dirs.static'), mapName)
    const defaultConfig = {
        from: entryPoint,
        to: outPath,
        map: {
            inline: false
        },
        plugins: []
    }

    if (isAfterSass) {
    } else {
        defaultConfig.plugins.push(cssImport)
        defaultConfig.plugins.push(cssNext)
    }

    defaultConfig.plugins.push(laggard)
    defaultConfig.plugins.push(cssImmutable)
    defaultConfig.plugins.push(postcssReporter({ clearMessages: true, throwError: false }))

    if (config.get('env') === "production") {
        defaultConfig.plugins.push(cssNano({ autoprefixer: false }))
    }

    const postcssConfig = merge.smartStrategy({
        plugins: 'replace'
    })(defaultConfig, config.get('configurePostcss'))

    postcssConfig.plugins.forEach((plugin, index) => {
        if (typeof plugin !== "function") {
            postcssConfig.plugins[index] = require(plugin)
        }
    })

    const renderedCss = () => new Promise((resolve, reject) => {
        fs.readFile(entryPoint, (err, css) => {
            if (err) reject(err)

            postcss(postcssConfig.plugins)
                .process(css, postcssConfig)
                .then(res => {
                    const warnings = res.warnings()

                    if (warnings) {
                        warnings.forEach(warning => console.warn(`${warning}\n`))
                    }

                    fs.writeFile(outPath, res.css, err => reject(err))

                    console.log(`\nWrote file: ${outPath}\n`)

                    if (res.map) {
                        fs.writeFile(outPathMap, res.map, err => reject(err))
                    }

                    resolve(outPath)
                })
                .catch(err => reject(err))
        })
    })
    await renderedCss()
}