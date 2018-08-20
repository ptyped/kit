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

    projectDir = projectDir ? projectDir : getFromApp('.')

    await dependency.get(config, template)
    await copyFromTemplate(template.output, projectDir)
}

/*
 * Copies template folder structure missing from project
 */
const copyFromTemplate = async (templatePath, projectPath) =>
    new Promise(async (resolve, reject) => {
        const templateFiles = glob.sync(templatePath + "/**/*");

        if (fs.existsSync(templatePath)) {
            if (!fs.existsSync(projectPath)) {
                ncp(templatePath, projectPath)
            } else {
                templateFiles.forEach(async file => {
                    const filePath = file.slice(templatePath.length + 1)
                    const appPath = path.resolve(projectPath, filePath)

                    fs.exists(appPath, exists => {
                        if (exists) {
                            ncp(file, appPath)
                        }
                    })
                })
            }
        }

        return resolve();
    });