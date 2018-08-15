#!/usr/bin/env node
const nodemon = require("nodemon")
const path = require('path')

const script = path.resolve(__dirname, "./index.js")

nodemon({
    script: script,
    ext: "js json",
    ignore: ["app"]
})