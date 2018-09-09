const $ = require('jquery');
const fs = require('fs-extra');
const path = require('path');
const request = require('supertest');

const App = require('./app')
const Config = require('./config')
const routesPath = path.resolve(__dirname, '../fixtures/app/routes.json')
const routes = JSON.parse(fs.readFileSync(routesPath, {encoding: 'utf8'}))
const getRouteExpected = (p) => {
    const expectedPath = path.resolve(__dirname, '../fixtures/app/responses/', routes[p])
    return fs.readFileSync(expectedPath, {encoding: 'utf8'})
}
let app, cwd, config

beforeAll(async () => {
    cwd = path.resolve(__dirname, '../fixtures/app/default_project')
    const configInstance = new Config({cwd: cwd})
    config = configInstance.config
    app = new App(config)
})

describe('The app should be running', () => {
    test('should resolve index.html', async () => {
        const p = "/"
        const req = request(app.app)
        const res = await req.get(p)
        const expected = getRouteExpected(p)

        expect(res.text).toBe(expected)
    })

    test('should resolve default 404 page', async () => {
        const p = "/404"
        const req = request(app.app)
        const res = await req.get(p)
        const expected = getRouteExpected(p)

        expect(res.text).toBe(expected)
    })
})

describe('The app should be resolving data', () => {
    let $res

    beforeEach(async () => {
        const p = "/"
        const req = request(app.app)
        const res = await req.get(p)
        $res = $(res.text)
    })

    test('Should resolve front matter data', async () => {
        const val = $res.find('#frontMatterKey').text()

        expect(val).toBe('true')
    })

    test('Should resolve route data', async () => {
        const val = $res.find('#routeKey').text()

        expect(val).toBe('true')
    })

    test('Should resolve local data', async () => {
        const val = $res.find('#localDataKey').text()

        expect(val).toBe('true')
    })

    test('Should resolve global data', async () => {
        const val = $res.find('#globalDataKey').text()

        expect(val).toBe('true')
    })

    test('Should resolve session data', async () => {
        const val = $res.find('#sessionKey').text()

        expect(val).toBe('true')
    })

    // TODO: verify session manipulation
    test.skip('Should take session data from GET request', () => {})

    // TODO: verify session manipulation
    test.skip('Should take session data from POST request', async () => {
        const p = "/"
        const req = request(app.app)
        const res = await req.post(p)
            .type('form')
            .send({ sessionKey: false })
        const $res = $(res.text)
        const val = $res.find('#sessionKey').text()

        expect(val).toBe('true')
    })

    test('Should be value from front matter', () => {
        const val = $res.find('#shouldBeFrontMatter').text()

        expect(val).toBe('true')  
    })

    test('Should be value from route data', () => {
        const val = $res.find('#shouldBeRouteData').text()

        expect(val).toBe('true')  
    })

    test('Should be value from local data', () => {
        const val = $res.find('#shouldBeLocalData').text()

        expect(val).toBe('true')  
    })
})