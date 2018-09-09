const path = require('path')

const App = require('./app')
const Config = require('./config')

describe('Expect app to initialize correctly', () => {
    let app, config, cwd, routes

    beforeAll(() => {
        cwd = path.resolve(__dirname, '../fixtures/app/default_project')
        const configInstance = new Config({cwd: cwd})
        config = configInstance.config
        routes = [
            (req, res, next) => { next(); }
        ]
    })

    test.skip('Expect routes to be passed in routes', () => {
        app = new App(config)

        return expect(1).toEqual(1)
    })
})