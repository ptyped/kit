module.exports = (router) => {
    router.get('/', (req, res, next) => {
        res.render('./index.html', {
            routeKey: true,
            shouldBeFrontMatter: false,
            shouldBeRouteData: true
        })
    })

    return {
        "/redirect": "/"
    }
}