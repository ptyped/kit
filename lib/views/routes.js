const express = require('express');
const router = express.Router();

/**
 * Clear session data when hitting this endpoint
 */
router.use('/_admin/clear-data', (req, res) => {
  const data = res.locals.data;

  req.session.destroy(err => {
    res.render('_admin/clear-data', { data: data }, (err, html) => {
      if (!err) {
        return res.end(html)
      }
  
      next(err)
    });
  })
});

module.exports = router;