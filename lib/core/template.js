const dependency = require('./dependency')
const fs = require('fs')
const {
    getFromProject,
    npmInstall
} = require('./utils')
const glob = require('glob')
const ncp = require('ncp')
const path = require('path')

const pkgPath = path.resolve(__dirname, "../../package.json")
const pkg = require(pkgPath)

class Template {
    constructor(config, projectPath) {
        this.config = config
        this.getFromProject = getFromProject(this.config)
        this.projectPath = projectPath ? projectPath : this.getFromProject('.')
        this.template = config.get('template')
    }

    async getDependency() {
        this.dependency = await dependency.create(this.config, this.template)
    }

    createProject() {
        return new Promise((resolve, reject) => {
            let appPkg = {}
            const projectPkgPath = path.resolve(this.projectPath, "package.json")
            const name = path.basename(this.projectPath)
            const script = path.basename(pkg.name)

            if (!fs.existsSync(this.projectPath)) {
                fs.mkdirSync(this.projectPath)
            }

            if (!fs.existsSync(projectPkgPath)) {
                appPkg = {
                    name: name,
                    version: '0.1.0',
                    private: true,
                    dependencies: {}
                }
            } else {
                appPkg = JSON.parse(fs.readFileSync(projectPkgPath))
            }

            appPkg = Object.assign(appPkg, {
                scripts: {
                    start: `${script} start`,
                    build: `${script} build`,
                },
                pkit: {
                    template: this.dependency.input
                }
            })

            fs.writeFileSync(projectPkgPath, JSON.stringify(appPkg))

            resolve()
        })
    }

    copy() {
        return new Promise(async (resolve, reject) => {
            const nodeModules = this.getFromProject('node_modules')
            const templatePath = path.resolve(nodeModules, this.dependency.name)
            const templateSrcPath = path.resolve(templatePath, "src")
            const templateFiles = glob.sync(templateSrcPath + "/**/*");

            if (fs.existsSync(templatePath)) {
                if (!fs.existsSync(this.projectPath)) {
                    ncp(templatePathSrc, this.projectPath)
                } else {
                    templateFiles.forEach(async file => {
                        const filePath = file.slice(templateSrcPath.length)
                        const appPath = path.join(this.projectPath, filePath)

                        if (!fs.existsSync(appPath)) {
                            ncp(file, appPath)
                        }
                    })
                }
            }

            resolve();
        })
    }

    async install() {
        try {
            await npmInstall([this.config.get('kitModule'), this.dependency.input], {ignoreYarn: true, cwd: this.config.get('cwd')})
        } catch (err) {
            throw err
        }
    }
}

module.exports = Template