const fs = require('fs')
const glob = require('glob')
const path = require('path')
const remove = require('rimraf')

const Config = require('./config')
const Template = require('./template')

describe('Run integration tests on template create', () => {
    let cwd, pkgPath, nodeModulesDir, kitDir, templateDir, appDir, staticDir, dataDir, dependencyDir, jsDir, cssDir, scssDir, template

    const initialize = async () => {
        const kitModule = path.resolve(process.cwd())
        const rand = String(new Date().getUTCMilliseconds())
        cwd = path.resolve(process.cwd(), "lib/fixtures/.tmp", rand)
        const configInstance = new Config({cwd: cwd, kitModule: kitModule})
        config = configInstance.config
        template = new Template(config)
        template = new Template(config)
        await template.getDependency()
        cwd = config.get('cwd')
        pkgPath = path.resolve(cwd, "./package.json")
        nodeModulesDir = path.resolve(cwd, "./node_modules")
        kitDir = path.resolve(nodeModulesDir, config.get('kitModule'))
        templateDir = path.resolve(nodeModulesDir, template.dependency.name)
        appDir = config.get('dirs.input')
        staticDir = config.get('dirs.static')
        dataDir = config.get('dirs.data')
        dependencyDir = config.get('dirs.data')
        jsDir = config.get('dirs.assets.js')
        cssDir = config.get('dirs.assets.css')
        scssDir = config.get('dirs.assets.scss')
    }

    beforeEach(() => {
        return initialize()
    })

    afterEach(() => {
        remove.sync(cwd)
    })

    test(`Expect only "cwd" to exist`, async () => {
        await template.createProject()

        expect(fs.existsSync(cwd)).toBe(true)
        expect(fs.existsSync(pkgPath)).toBe(true)
        expect(fs.existsSync(nodeModulesDir)).toBe(false)
        expect(fs.existsSync(appDir)).toBe(false)
        expect(fs.existsSync(staticDir)).toBe(false)
    })

    test(`Expect node_modules to install correctly`, async () => {
        await template.createProject()
        await template.install()

        expect(fs.existsSync(cwd)).toBe(true)
        expect(fs.existsSync(nodeModulesDir)).toBe(true)
        expect(fs.existsSync(pkgPath)).toBe(true)
        expect(fs.existsSync(templateDir)).toBe(true)
        expect(fs.existsSync(appDir)).toBe(false)
        expect(fs.existsSync(staticDir)).toBe(false)
    })

    test(`Expect all template files and dirs to exist`, async () => {
        await template.createProject()
        await template.install()
        await template.copy()

        const files = glob.sync(template.dependency.output + "/**/*").filter(p => !fs.lstatSync(p).isDirectory())

        expect(fs.existsSync(cwd)).toBe(true)
        expect(fs.existsSync(nodeModulesDir)).toBe(true)
        expect(fs.existsSync(pkgPath)).toBe(true)
        expect(fs.existsSync(templateDir)).toBe(true)
        expect(fs.existsSync(appDir)).toBe(true)
        expect(fs.existsSync(jsDir)).toBe(true)
        expect(fs.existsSync(dataDir)).toBe(true)
        expect(fs.existsSync(jsDir)).toBe(true)
        expect(fs.existsSync(cssDir)).toBe(true)
        expect(fs.existsSync(scssDir)).toBe(true)
        expect(fs.existsSync(staticDir)).toBe(true)
        expect(fs.existsSync(dependencyDir)).toBe(true)

        for (var key in files) {
            const file = files[key]

            expect(fs.existsSync(file)).toBe(true)
        }
    })
})