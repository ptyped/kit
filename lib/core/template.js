const dependency = require('./dependency')
const fs = require('fs')
const {
    getFromApp
} = require('./utils')
const glob = require('glob')
const ncp = require('ncp')
const path = require('path')
const spawn = require('cross-spawn')

const useYarn = fs.existsSync(getFromApp('yarn.lock'))
const command = useYarn
    ? "yarnpkg" 
    : "npm"
const pkgPath = path.resolve(__dirname, "../../package.json")
const pkg = require(pkgPath)

/**
 * Copies a template from its source to the app
 * 
 * @param {*} config 
 * @param {*} templatePath 
 */
module.exports = async (config, projectPath) => {
    const template = await dependency.create(config, config.get('template'))
    const templatePath = path.resolve(template.output, "src")
    const templateConfigPath = path.resolve(template.output, ".kit.js")

    projectPath = projectPath ? projectPath : getFromApp('.')

    await dependency.get(config, template)
    await createTemplateProject(projectPath)
    await installTemplateDependencies(template)
    await copyFromTemplate(templatePath, projectPath)

    if (fs.existsSync(templateConfigPath)) {
        const rawTemplateConfig = require(templateConfigPath)(config)
        const templateConfig = typeof rawTemplateConfig === "function" ? rawTemplateConfig() : rawTemplateConfig
        config.load(templateConfig)
    }
}

/*
 * Copies template folder structure missing from project
 */
const copyFromTemplate = async (templatePath, projectPath) =>
    new Promise(async (resolve, reject) => {
        const templateFiles = glob.sync(templatePath + "/**/*");

        console.log(templateFiles)

        if (fs.existsSync(templatePath)) {
            if (!fs.existsSync(projectPath)) {
                ncp(templateSrc, projectPath)
            } else {
                templateFiles.forEach(async file => {
                    const filePath = file.slice(templatePath.length + 1)
                    const appPath = path.resolve(projectPath, filePath)

                    fs.exists(appPath, exists => {
                        if (!exists) {
                            ncp(file, appPath)
                        }
                    })
                })
            }
        }

        return resolve();
    });

const createTemplateProject = (projectPath) => new Promise((resolve, reject) => {
    const projectPkgPath = path.resolve(projectPath, "package.json")
    const args = useYarn
        ? ['add']
        : ['install', '--save']
    const toInstall = [pkg.name]
    
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath)
    }

    if (!fs.existsSync(projectPath)) {
        const appPkg = {
            name: path.basename(projectPath),
            scripts: {
                start: `${pkg.name} start`,
                start: `${pkg.name} build`,
            },
            version: '0.1.0',
            private: true
        }

        fs.writeFileSync(projectPkgPath, appPkg)
    }

    args.push(toInstall)

    const proc = spawn.sync(command, args, {stdio: 'inherit'})

    if (proc.status !== 0) {
        reject(`${command} ${args.join(' ')} failed`)
    }

})

const installTemplateDependencies = (template) => new Promise((resolve, reject) => {
    const args = useYarn
        ? ['add']
        : ['install', '--save']
    const templatePkgPath = path.resolve(template.output, "package.json")
    const templatePkg = require(templatePkgPath)
    const templateDeps = templatePkg.dependencies

    const toInstall = Object.keys(templateDeps).filter(key => {
        return Object.keys(pkg.dependencies).indexOf(key) === -1
    })

    args.push(toInstall)

    const proc = spawn.sync(command, args, {stdio: 'inherit'})

    if (proc.status !== 0) {
        reject(`${command} ${args.join(' ')} failed`)
    }

    resolve()
})