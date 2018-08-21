const dependency = require('./dependency')
const fs = require('fs')
const {
    getFromApp
} = require('./utils')
const glob = require('glob')
const ncp = require('ncp')
const path = require('path')

/**
 * Copies a template from its source to the app
 * 
 * @param {*} config 
 * @param {*} templatePath 
 */
module.exports = async (config, projectDir) => {
    const template = await dependency.create(config, config.get('template'))
    const templatePath = path.resolve(template.output, "src")

    projectDir = projectDir ? projectDir : getFromApp('.')

    await dependency.get(config, template)
    await copyFromTemplate(templatePath, projectDir)
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