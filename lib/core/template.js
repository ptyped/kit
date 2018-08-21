const dependency = require('./dependency')
const fs = require('fs')
const {
    getFromApp,
    npmInstall
} = require('./utils')
const glob = require('glob')
const ncp = require('ncp')
const path = require('path')

const pkgPath = path.resolve(__dirname, "../../package.json")
const pkg = require(pkgPath)

/**
 * Copies a template from its source to the app
 * 
 * @param {*} config 
 * @param {*} templatePath 
 */
module.exports = async (config, projectPath) => {
    const template = config.get('template')
    const templateDep = await dependency.create(config, template)
    const templatePath = path.resolve(getFromApp('node_modules'), templateDep.name)
    const templateConfigPath = path.resolve(templatePath, ".kit.js")

    projectPath = projectPath ? projectPath : getFromApp('.')

    await createTemplateProject(templateDep, projectPath)
    await npmInstall([config.get('kitModule'), templateDep.name], true)
    await copyFromTemplate(templatePath, projectPath)

    if (fs.existsSync(templateConfigPath)) {
        const rawTemplateConfig = require(templateConfigPath)(config)
        const templateConfig = typeof rawTemplateConfig === "function" ? rawTemplateConfig() : rawTemplateConfig
        config.load(templateConfig)
    }
}

const createTemplateProject = async (templateDep, projectPath) => new Promise((resolve, reject) => {
    let appPkg = {}
    const projectPkgPath = path.resolve(projectPath, "package.json")

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath)
    }

    if (!fs.existsSync(projectPkgPath)) {
        appPkg = {
            name: path.basename(projectPath),
            version: '0.1.0',
            private: true,
            scripts: {
                start: `${pkg.name} start`,
                start: `${pkg.name} build`,
            },
            dependencies: {}
        }
    } else {
        appPkg = JSON.parse(fs.readFileSync(projectPkgPath))
    }

    fs.writeFileSync(projectPkgPath, JSON.stringify(appPkg))

    resolve()
})

/*
 * Copies template folder structure missing from project
 */
const copyFromTemplate = async (templatePath, projectPath) =>
    new Promise(async (resolve, reject) => {
        const templateSrcPath = path.resolve(templatePath, "src")
        const templateFiles = glob.sync(templateSrcPath + "/**/*");

        if (fs.existsSync(templatePath)) {
            if (!fs.existsSync(projectPath)) {
                ncp(templatePath, projectPath)
            } else {
                templateFiles.forEach(async file => {
                    const filePath = file.slice(templateSrcPath.length)
                    const appPath = path.join(projectPath, filePath)

                    if (!fs.existsSync(appPath)) {
                        ncp(file, appPath)
                    }
                })
            }
        }

        return resolve();
    });