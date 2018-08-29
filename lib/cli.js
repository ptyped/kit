#!/usr/bin/env node
(async() => {

    if (process.env.DEBUG) {
        require("time-require");
    }

    const program = require('commander')
    const fs = require('fs')
    const nodemon = require('nodemon')
    const path = require('path')

    const Config = require('./core/config')
    const configInstance = new Config()
    await configInstance.loadFromTemplateConfig()
    const config = configInstance.config
    const Daemon = require('./core/daemon')
    const debug = require('debug')('pkit')
    const localConfig = config.getProperties()
    const pkg = require('../package.json')
    const {
        build,
        init,
        updateDependencies
    } = require('./index')
    let {
        getFromProject,
        getConfigArgs
    } = require('./core/utils')
    let args = getConfigArgs(config.getSchema())

    getFromProject = getFromProject(config)

    if (config.getArgs[0] !== "daemon") {
        config.set('verbose', true)
    }

    /**
     * Initialize program
     */
    program
        .version(pkg.version)
        .name('pkit')
        .description(pkg.description)

    /**
     * Add args to program
     */
    Object.keys(args).forEach(key => {
        program
            .option(`--${args[key].arg}`, args[key].doc)
    })

    /**
     * Init command
     */
    program
        .command('init [projectDir]')
        .action((dir, cmd) => init(localConfig, dir))

    /**
     * Update command
     */
    program
    .command('update [projectDir]')
    .action((dir, cmd) => updateDependencies(localConfig, dir))

    /**
     * Start command
     */
    program
        .command('start')
        .action(() => {
            const viewsPath = config.get('dirs.views')
            const dataPath = config.get('dirs.data')
            const serverPath = path.resolve(__dirname, "./server.js")
            const nodemonOpts = {
                script: serverPath,
                ext: 'js json yml',
                watch: [
                    __dirname,
                    viewsPath,
                    dataPath
                ],
                env: {
                    "NODE_ENV": config.get('env')
                }
            }

            const server = nodemon(nodemonOpts)

            server.on('start', () => debug('Nodemon started'))
            server.on('quit', () => debub('Nodemon stopped'))
            server.on('restart', (files) => debug('Nodemon resarted due to changes in files: %o', files))
        })

    /**
     * Build command
     */
    program
        .command('build')
        .action(() => build(localConfig))

    /**
     * Add daemon command
     */
    program
        .command('daemon')
        .option('--stop', 'Stops the daemon process')
        .action((args) => {
            let pkgApp
            const pkgAppPath = getFromProject('package.json')

            if (fs.existsSync(pkgAppPath)) {
                pkgApp = require(pkgAppPath)
            }

            const pkgName = pkgApp ? pkgApp.name : pkg.name
            const daemon = new Daemon(config, pkgName)

            if (args.stop) {
                daemon.stop()
            } else {
                daemon.start()
            }
        })

    /**
     * Show error for unknown commands
     */
    program.on('command:*', function () {
        console.error('Invalid command: %s\nSee --help for a list of available commands.\n', program.args.join(' '));
        process.exit(0);
    });

    /**
     * Add arguments to program
     */
    program
        .parse(process.argv)
})()