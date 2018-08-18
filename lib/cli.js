#!/usr/bin/env node
const program = require('commander')

if (process.env.DEBUG) {
    require("time-require");
}

const pkg = require('../package.json')
const daemon = require('./core/daemon')

const {
    start,
    init
} = require('./index')

program
    .version(pkg.version)
    .name(pkg.name)
    .description(pkg.description)

program
    .command('init')
    .action(init)

program
    .command('start')
    .action(start)

program
    .command('daemon')
    .action(daemon)

program
    .parse(process.argv)