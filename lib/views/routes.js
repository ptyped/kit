const express = require('express')
const router = express.Router()

/**
 * Clear session data when hitting this endpoint
 */
router.use('/_admin/clear-data', (req, res) => {
    req.session.destroy()
    res.render('_admin/clear-data')
})

module.exports = router