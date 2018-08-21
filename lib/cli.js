#!/usr/bin/env node

if (process.env.DEBUG) {
    require("time-require");
}

const program = require('commander')

const config = require('./core/config')
const pkg = require('../package.json')
const daemon = require('./core/daemon')
const {
    getConfigArgs
} = require('./core/utils')
const {
    build,
    init,
    start
} = require('./index')

config()
    .then(appConfig => {
        let args = getConfigArgs(appConfig.getSchema())
        const localConfig = appConfig.getProperties()

        if (appConfig.getArgs[0] !== "daemon") {
            appConfig.set('verbose', true)
        }

        /**
         * Initialize program
         */
        program
            .version(pkg.version)
            .name(pkg.name)
            .description(pkg.description)

        /**
         * Add args to program
         */
        Object.keys(args).forEach(key => {
            program
                .option(`--${args[key].arg}`, args[key].doc)
        })

        /**
         * Add init command
         */
        program
            .command('init')
            .action(() => init(localConfig))

        /**
         * Start command
         */
        program
            .command('start')
            .action(() => start(localConfig))

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
                let pkgApg
                const pkgAppPath = getFromApp('package.json')

                if (fs.existsSync(pkgAppPath)) {
                    pkgApp = require(pkgAppPath)
                }

                const pkgName = pkgApp ? pkgApp.name : pkg.name

                if (args.stop) {
                    daemon.stop(appConfig, pkgName)
                } else {
                    daemon.start(appConfig, pkgName)
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
    })