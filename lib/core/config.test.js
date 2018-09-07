const path = require('path')

const Config = require('./config')

describe('Expect a default configuration', () => {
    let configInstance = new Config()
    let config = configInstance.config

    test('Expect "cwd" to be directory process was called from', () => {
        expect(config.get('cwd')).toBe(configInstance.schema.cwd.default)
    })

    test(`Expect "env" to be "test"`, () => {
        expect(config.get('env')).toBe('test')
    })

    test(`Expect "verbose" to be "${configInstance.schema.verbose.default}"`, () => {
        expect(config.get('verbose')).toBe(configInstance.schema.verbose.default)
    })

    test(`Expect "ip" to be "${configInstance.schema.ip.default}"`, () => {
        expect(config.get('verbose')).toBe(configInstance.schema.verbose.default)
    })

    test(`Expect "port" to be "${configInstance.schema.port.default}"`, () => {
        expect(config.get('port')).toBe(Number(configInstance.schema.port.default))
    })

    test(`Expect "kitModule" to be "${configInstance.schema.kitModule.default}"`, () => {
        expect(config.get('kitModule')).toBe(configInstance.schema.kitModule.default) 
    })

    test(`Expect "template" to be "${configInstance.schema.template.default}"`, () => {
        expect(config.get('template')).toBe(configInstance.schema.template.default) 
    })

    test(`Expect "publicPath" to be "${configInstance.schema.publicPath.default}"`, () => {
        expect(config.get('publicPath')).toBe(configInstance.schema.publicPath.default) 
    })

    test(`Expect "dependencies" to be "${configInstance.schema.dependencies.default}"`, () => {
        expect(config.get('dependencies')).toEqual(configInstance.schema.dependencies.default) 
    })

    test(`Expect "configureWebpack" to be "${configInstance.schema.configureWebpack.default}"`, () => {
        expect(config.get('configureWebpack')).toEqual(configInstance.schema.configureWebpack.default) 
    })

    test(`Expect "configurePostcss" to be "${configInstance.schema.configurePostcss.default}"`, () => {
        expect(config.get('configurePostcss')).toEqual(configInstance.schema.configurePostcss.default) 
    })
    
    test(`Expect "configureSass" to be "${configInstance.schema.configureSass.default}"`, () => {
        expect(config.get('configureSass')).toEqual(configInstance.schema.configureSass.default) 
    })

    test(`Expect "configurePostcssAfterSass" to be "${configInstance.schema.configurePostcssAfterSass.default}"`, () => {
        expect(config.get('configurePostcssAfterSass')).toEqual(configInstance.schema.configurePostcssAfterSass.default) 
    })

    test(`Expect "dirs.input" to be "${configInstance.schema.dirs.input.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)

        expect(config.get('dirs.input')).toBe(inputDir) 
    })

    test(`Expect "dirs.views" to be "${configInstance.schema.dirs.views.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.views.default)

        expect(config.get('dirs.views')).toBe(expected) 
    })

    test(`Expect "dirs.data" to be "${configInstance.schema.dirs.data.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.data.default)
        
        expect(config.get('dirs.data')).toBe(expected) 
    })

    test(`Expect "dirs.static" to be "${configInstance.schema.dirs.static.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.static.default)

        expect(config.get('dirs.static')).toBe(expected) 
    })

    test(`Expect "dirs.dependencies" to be "${configInstance.schema.dirs.dependencies.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.dependencies.default)

        expect(config.get('dirs.dependencies')).toBe(expected)
    })

    test(`Expect "dirs.assets.js" to be "${configInstance.schema.dirs.assets.js.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.assets.js.default)

        expect(config.get('dirs.assets.js')).toBe(expected) 
    })

    test(`Expect "dirs.assets.css" to be "${configInstance.schema.dirs.assets.css.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.assets.css.default)

        expect(config.get('dirs.assets.css')).toBe(expected)
    })

    test(`Expect "dirs.assets.scss" to be "${configInstance.schema.dirs.assets.scss.default}"`, () => {
        const inputDir = path.join(process.cwd(), configInstance.schema.dirs.input.default)
        const expected = path.join(inputDir, configInstance.schema.dirs.assets.scss.default)

        expect(config.get('dirs.assets.scss')).toBe(expected)
    })
})

describe('Expect a custom manual configuration', () => {
    const manualConfig = require('../fixtures/config/only_manual/manualConfig')
    let configInstance = new Config(manualConfig)
    let config = configInstance.config

    test('Expect "cwd" to be directory process was called from', () => {
        expect(config.get('cwd')).toBe(manualConfig.cwd)
    })

    test(`Expect "env" to be "test"`, () => {
        expect(config.get('env')).toBe('test')
    })

    test(`Expect "verbose" to be "${manualConfig.verbose}"`, () => {
        expect(config.get('verbose')).toBe(manualConfig.verbose)
    })

    test(`Expect "ip" to be "${manualConfig.ip}"`, () => {
        expect(config.get('verbose')).toBe(manualConfig.verbose)
    })

    test(`Expect "port" to be "${manualConfig.port}"`, () => {
        expect(config.get('port')).toBe(Number(manualConfig.port))
    })

    test(`Expect "kitModule" to be "${manualConfig.kitModule}"`, () => {
        expect(config.get('kitModule')).toBe(manualConfig.kitModule) 
    })

    test(`Expect "template" to be "${manualConfig.template}"`, () => {
        expect(config.get('template')).toBe(manualConfig.template) 
    })

    test(`Expect "publicPath" to be "${manualConfig.publicPath}"`, () => {
        expect(config.get('publicPath')).toBe(manualConfig.publicPath) 
    })

    test(`Expect "dependencies" to be "${manualConfig.dependencies}"`, () => {
        expect(config.get('dependencies')).toEqual(manualConfig.dependencies) 
    })

    test(`Expect "configureWebpack" to be "${manualConfig.configureWebpack}"`, () => {
        expect(config.get('configureWebpack')).toEqual(manualConfig.configureWebpack) 
    })

    test(`Expect "configurePostcss" to be "${manualConfig.configurePostcss}"`, () => {
        expect(config.get('configurePostcss')).toEqual(manualConfig.configurePostcss) 
    })
    
    test(`Expect "configureSass" to be "${manualConfig.configureSass}"`, () => {
        expect(config.get('configureSass')).toEqual(manualConfig.configureSass) 
    })

    test(`Expect "configurePostcssAfterSass" to be "${manualConfig.configurePostcssAfterSass}"`, () => {
        expect(config.get('configurePostcssAfterSass')).toEqual(manualConfig.configurePostcssAfterSass) 
    })

    test(`Expect "dirs.input" to be "${manualConfig.dirs.input}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)

        expect(config.get('dirs.input')).toBe(inputDir) 
    })

    test(`Expect "dirs.views" to be "${manualConfig.dirs.views}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.views)

        expect(config.get('dirs.views')).toBe(expected) 
    })

    test(`Expect "dirs.data" to be "${manualConfig.dirs.data}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.data)
        
        expect(config.get('dirs.data')).toBe(expected) 
    })

    test(`Expect "dirs.static" to be "${manualConfig.dirs.static}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.static)

        expect(config.get('dirs.static')).toBe(expected) 
    })

    test(`Expect "dirs.dependencies" to be "${manualConfig.dirs.dependencies}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.dependencies)

        expect(config.get('dirs.dependencies')).toBe(expected)
    })

    test(`Expect "dirs.assets.js" to be "${manualConfig.dirs.assets.js}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.assets.js)

        expect(config.get('dirs.assets.js')).toBe(expected) 
    })

    test(`Expect "dirs.assets.css" to be "${manualConfig.dirs.assets.css}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.assets.css)

        expect(config.get('dirs.assets.css')).toBe(expected)
    })

    test(`Expect "dirs.assets.scss" to be "${manualConfig.dirs.assets.scss}"`, () => {
        const inputDir = path.join(manualConfig.cwd, manualConfig.dirs.input)
        const expected = path.join(inputDir, manualConfig.dirs.assets.scss)

        expect(config.get('dirs.assets.scss')).toBe(expected)
    })
})

describe('Expect a project configuration', () => {
    const cwd = path.resolve(__dirname, "../fixtures/config/only_project")
    const pkgConfig = require(path.resolve(cwd, 'package.json')).pkit
    let configInstance = new Config({ cwd: cwd })
    let config = configInstance.config

    test(`Expect "cwd" to be "${cwd}"`, () => {
        expect(config.get('cwd')).toBe(cwd)
    })

    test(`Expect "env" to be "production"`, () => {
        expect(config.get('env')).toBe('test')
    })

    test(`Expect "verbose" to be "${pkgConfig.verbose}"`, () => {
        expect(config.get('verbose')).toBe(pkgConfig.verbose)
    })

    test(`Expect "ip" to be "${pkgConfig.ip}"`, () => {
        expect(config.get('verbose')).toBe(pkgConfig.verbose)
    })

    test(`Expect "port" to be "${pkgConfig.port}"`, () => {
        expect(config.get('port')).toBe(Number(pkgConfig.port))
    })

    test(`Expect "kitModule" to be "${pkgConfig.kitModule}"`, () => {
        expect(config.get('kitModule')).toBe(pkgConfig.kitModule) 
    })

    test(`Expect "template" to be "${pkgConfig.template}"`, () => {
        expect(config.get('template')).toBe(pkgConfig.template) 
    })

    test(`Expect "publicPath" to be "${pkgConfig.publicPath}"`, () => {
        expect(config.get('publicPath')).toBe(pkgConfig.publicPath) 
    })

    test(`Expect "dependencies" to be "${pkgConfig.dependencies}"`, () => {
        expect(config.get('dependencies')).toEqual(pkgConfig.dependencies) 
    })

    test(`Expect "configureWebpack" to be "${pkgConfig.configureWebpack}"`, () => {
        expect(config.get('configureWebpack')).toEqual(pkgConfig.configureWebpack) 
    })

    test(`Expect "configurePostcss" to be "${pkgConfig.configurePostcss}"`, () => {
        expect(config.get('configurePostcss')).toEqual(pkgConfig.configurePostcss) 
    })
    
    test(`Expect "configureSass" to be "${pkgConfig.configureSass}"`, () => {
        expect(config.get('configureSass')).toEqual(pkgConfig.configureSass) 
    })

    test(`Expect "configurePostcssAfterSass" to be "${pkgConfig.configurePostcssAfterSass}"`, () => {
        expect(config.get('configurePostcssAfterSass')).toEqual(pkgConfig.configurePostcssAfterSass) 
    })

    test(`Expect "dirs.input" to be "${pkgConfig.dirs.input}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)

        expect(config.get('dirs.input')).toBe(inputDir) 
    })

    test(`Expect "dirs.views" to be "${pkgConfig.dirs.views}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.views)

        expect(config.get('dirs.views')).toBe(expected) 
    })

    test(`Expect "dirs.data" to be "${pkgConfig.dirs.data}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.data)
        
        expect(config.get('dirs.data')).toBe(expected) 
    })

    test(`Expect "dirs.static" to be "${pkgConfig.dirs.static}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.static)

        expect(config.get('dirs.static')).toBe(expected) 
    })

    test(`Expect "dirs.dependencies" to be "${pkgConfig.dirs.dependencies}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.dependencies)

        expect(config.get('dirs.dependencies')).toBe(expected)
    })

    test(`Expect "dirs.assets.js" to be "${pkgConfig.dirs.assets.js}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.assets.js)

        expect(config.get('dirs.assets.js')).toBe(expected) 
    })

    test(`Expect "dirs.assets.css" to be "${pkgConfig.dirs.assets.css}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.assets.css)

        expect(config.get('dirs.assets.css')).toBe(expected)
    })

    test(`Expect "dirs.assets.scss" to be "${pkgConfig.dirs.assets.scss}"`, () => {
        const inputDir = path.join(cwd, pkgConfig.dirs.input)
        const expected = path.join(inputDir, pkgConfig.dirs.assets.scss)

        expect(config.get('dirs.assets.scss')).toBe(expected)
    })
})

describe('Expect a template configuration', () => {
    const cwd = path.resolve(__dirname, '../fixtures/config/only_template')
    const templatePath = path.resolve(cwd, "./node_modules/template")
    const template = "file:" + templatePath
    const templateConfig = require(path.resolve(templatePath, "./.kit.js"))
    let configInstance = new Config({ cwd: cwd, template: template })
    let config = configInstance.config

    beforeAll(() => {
        return new Promise((resolve, reject) => {
            configInstance.loadFromTemplateConfig()
                .then(() => {
                    config = configInstance.config
                    resolve()
                })
                .catch((err) => reject(err))
        })
    })

    test(`Expect "cwd" to be "${templateConfig.cwd}"`, () => {
        expect(config.get('cwd')).toBe(templateConfig.cwd)
    })

    test(`Expect "env" to be "production"`, () => {
        expect(config.get('env')).toBe('test')
    })

    test(`Expect "verbose" to be "${templateConfig.verbose}"`, () => {
        expect(config.get('verbose')).toBe(templateConfig.verbose)
    })

    test(`Expect "ip" to be "${templateConfig.ip}"`, () => {
        expect(config.get('verbose')).toBe(templateConfig.verbose)
    })

    test(`Expect "port" to be "${templateConfig.port}"`, () => {
        expect(config.get('port')).toBe(Number(templateConfig.port))
    })

    test(`Expect "kitModule" to be "${templateConfig.kitModule}"`, () => {
        expect(config.get('kitModule')).toBe(templateConfig.kitModule) 
    })

    test(`Expect "template" to be "${templateConfig.template}"`, () => {
        expect(config.get('template')).toBe(templateConfig.template) 
    })

    test(`Expect "publicPath" to be "${templateConfig.publicPath}"`, () => {
        expect(config.get('publicPath')).toBe(templateConfig.publicPath) 
    })

    test(`Expect "dependencies" to be "${templateConfig.dependencies}"`, () => {
        expect(config.get('dependencies')).toEqual(templateConfig.dependencies) 
    })

    test(`Expect "configureWebpack" to be "${templateConfig.configureWebpack}"`, () => {
        expect(config.get('configureWebpack')).toEqual(templateConfig.configureWebpack) 
    })

    test(`Expect "configurePostcss" to be "${templateConfig.configurePostcss}"`, () => {
        expect(config.get('configurePostcss')).toEqual(templateConfig.configurePostcss) 
    })
    
    test(`Expect "configureSass" to be "${templateConfig.configureSass}"`, () => {
        expect(config.get('configureSass')).toEqual(templateConfig.configureSass) 
    })

    test(`Expect "configurePostcssAfterSass" to be "${templateConfig.configurePostcssAfterSass}"`, () => {
        expect(config.get('configurePostcssAfterSass')).toEqual(templateConfig.configurePostcssAfterSass) 
    })

    test(`Expect "dirs.input" to be "${templateConfig.dirs.input}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)

        expect(config.get('dirs.input')).toBe(inputDir) 
    })

    test(`Expect "dirs.views" to be "${templateConfig.dirs.views}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.views)

        expect(config.get('dirs.views')).toBe(expected) 
    })

    test(`Expect "dirs.data" to be "${templateConfig.dirs.data}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.data)
        
        expect(config.get('dirs.data')).toBe(expected) 
    })

    test(`Expect "dirs.static" to be "${templateConfig.dirs.static}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.static)

        expect(config.get('dirs.static')).toBe(expected) 
    })

    test(`Expect "dirs.dependencies" to be "${templateConfig.dirs.dependencies}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.dependencies)

        expect(config.get('dirs.dependencies')).toBe(expected)
    })

    test(`Expect "dirs.assets.js" to be "${templateConfig.dirs.assets.js}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.assets.js)

        expect(config.get('dirs.assets.js')).toBe(expected) 
    })

    test(`Expect "dirs.assets.css" to be "${templateConfig.dirs.assets.css}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.assets.css)

        expect(config.get('dirs.assets.css')).toBe(expected)
    })

    test(`Expect "dirs.assets.scss" to be "${templateConfig.dirs.assets.scss}"`, () => {
        const inputDir = path.join(templateConfig.cwd, templateConfig.dirs.input)
        const expected = path.join(inputDir, templateConfig.dirs.assets.scss)

        expect(config.get('dirs.assets.scss')).toBe(expected)
    })
})

describe('Expect chain of configs to resolve correctly', () => {
    const cwd = path.resolve(__dirname, '../fixtures/config/all')
    const templatePath = path.resolve(cwd, "./node_modules/template")
    const template = "file:" + templatePath
    const templateConfig = require(path.resolve(templatePath, "./.kit.js"))
    const pkgPath = path.resolve(cwd, 'package.json')
    const pkg = require(pkgPath).pkit
    const manualPath = path.resolve(cwd, 'manualConfig.js')
    const manualConfig = require(manualPath)
    let configInstance = new Config(Object.assign(manualConfig, { cwd: cwd, template: template }))
    let config = configInstance.config

    test(`Expect "cwd" to be "${configInstance.schema.cwd.default}"`, () => {
        expect(config.get('cwd')).toBe(cwd)
    })

    test(`Expect "publicPath" to be "${manualConfig.publicPath}"`, () => {
        expect(config.get('publicPath')).toBe(manualConfig.publicPath)
    })

    test(`Expect "dirs.input" to be "${pkg.dirs.input}"`, () => {
        const expected = path.resolve(cwd, pkg.dirs.input)

        expect(config.get('dirs.input')).toBe(expected)
    })

    test(`Expect "publicPath" to be "${templateConfig.publicPath}`, async () => {
        await configInstance.loadFromTemplateConfig()
        config = configInstance.config

        expect(config.get('publicPath')).toBe(templateConfig.publicPath)
    })

    test(`Expect "dirs.input" to be "${pkg.dirs.input}`, async () => {
        await configInstance.loadFromTemplateConfig()
        config = configInstance.config

        const expected = path.resolve(cwd, pkg.dirs.input)

        expect(config.get('dirs.input')).toBe(expected)
    })
})