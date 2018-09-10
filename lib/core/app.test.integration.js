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

async function createDefaultApp() {
    cwd = path.resolve(__dirname, '../fixtures/app/default_project')
    const configInstance = new Config({cwd: cwd})
    config = configInstance.config
    app = new App(config)
}

beforeAll(createDefaultApp)

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
    let p, req, res, $res

    beforeEach(async () => {
        p = "/"
        req = request(app.app)
        res = await req.get(p)
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

    test('Should resolve sibling local data', async () => {
        const val = $res.find('#localDataKey').text()

        expect(val).toBe('true')
    })

    test('Child pages should resolve sibling local data', async () => {
        p = '/sibling/child/'
        res = await req.get(p)
        $res = $(res.text)
        const val = $res.find('#childLocalDataKey').text()

        expect(val).toBe('true')
    })

    test('Child pages should resolve parent local data', async () => {
        p = '/sibling/child/'
        res = await req.get(p)
        $res = $(res.text)
        const val = $res.find('#localDataKey').text()

        expect(val).toBe('true')
    })

    test('Parent pages shouldn\'t resolve child local data', async () => {
        const val = $res.find('#childLocalDataKey').text()

        expect(val).toBe('')
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
    test.skip('Should take session data from GET request', async () => {})

    // TODO: verify session manipulation
    test.skip('Should take session data from POST request', async () => {
        res = await req.post(p)
            .type('form')
            .send({ sessionKey: false })
        $res = $(res.text)
        const val = $res.find('#sessionKey').text()

        expect(val).toBe('true')
    })

    test('Should be value from front matter', async () => {
        const val = $res.find('#shouldBeFrontMatter').text()

        expect(val).toBe('true')  
    })

    test('Should be value from route data', async () => {
        const val = $res.find('#shouldBeRouteData').text()

        expect(val).toBe('true')  
    })

    test('Should be value from local data', async () => {
        const val = $res.find('#shouldBeLocalData').text()

        expect(val).toBe('true')  
    })
})

describe('The app should support authentication', () => {
    let p, req, res, $res, authConfig, authApp

    beforeAll(async () => {
        const configInstance = new Config({
            cwd: cwd, 
            auth: {
                username: 'admin',
                password: 'password'
            }
        })
        authConfig = configInstance.config
        authApp = new App(authConfig)
    })

    beforeEach(async () => {
        p = "/"
        req = request(authApp.app)
        res = await req.get(p)
        $res = $(res.text)
    })

    afterAll(createDefaultApp)

    test('Should get failed auth page', async () => {
        const user = password = 'incorrect'
        const base64encodedAuth = new Buffer(user + ':' + password).toString('base64');
        res = await req.get(p)
            .set('Authorization', 'Basic ' + base64encodedAuth)
        $res = $(res.text)
        const val = $res.find('h1')

        expect(val).toBe('Authorization failed');
    })

    test('Should get index page', async () => {
        const user = 'admin'
        const password = 'password'
        const base64encodedAuth = new Buffer(user + ':' + password).toString('base64');
        const expected = getRouteExpected(p);
        res = await req.get(p)
            .set('Authorization', 'Basic ' + base64encodedAuth);

        expect(res.text).toBe(expected);
    })
})