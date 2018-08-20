const fs = require('fs')
const { getFrontmatterDataFromData } = require('../utils')
const glob = require('glob')
const matter = require('gray-matter')
const path = require('path')

const acceptedExts = ["js", "json", "yaml", "yml"]

module.exports = config => (req, res, next) => {
    addGlobalDataFiles(config, req, res)
    addLocalDataFiles(config, req, res)
    next()
}

const addGlobalDataFiles = (config, req, res) => {
    const globPattern = path.join(config.get('dirs.data'), `**/*.{${acceptedExts.join(",")}}`)
    const dataFiles = glob.sync(globPattern).filter(file => {
        const fileName = path.basename(file)
        const dirName = path.dirname(file)
        const isSessionFile = dirName === "data" && fileName === "session.json"
        const isDataFile = dirName === "data" && fileName === "data.json"

        return !isSessionFile && !isDataFile
    })

    dataFiles.forEach(file => {
        const fmt  = getFrontmatterDataFromData(config, file)
        const fileName = path.basename(file)
        const ext = path.extname(fileName)
        const name = fileName.replace(ext, "")
        const data = {}

        data[name] = fmt.data

        res.locals = Object.assign(res.locals, data)
    })
}

const addLocalDataFiles = (config, req, res) => {
    const globPattern = path.join(config.get('dirs.views'), `**/data.{${acceptedExts.join(",")}}`)
    const dataFiles = glob.sync(globPattern)

    dataFiles.forEach(file => {
        const fileRelPath = file.replace(config.get('dirs.views'), "")
        const fileRelDir = path.dirname(fileRelPath) + "/"
        const fmt  = getFrontmatterDataFromData(config, file)

        if (req.path === "/" && fileRelDir === ".") {
            res.locals = Object.assign(res.locals, fmt.data)
        } else if (req.path.indexOf(fileRelDir) > -1) {
            res.locals = Object.assign(res.locals, fmt.data)
        }
    })
}