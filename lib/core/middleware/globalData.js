const fs = require('fs')
const { getFrontmatterDataFromData } = require('../utils')
const glob = require('glob')
const matter = require('gray-matter')
const path = require('path')

module.exports = config => (req, res, next) => {
    const globPattern = path.join(config.dirs.data, "**/*.{json,yaml,js}")
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

    next()
}