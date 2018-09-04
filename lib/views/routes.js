const express = require('express');
const router = express.Router();

/**
 * Clear session data when hitting this endpoint
 */
router.use('/_admin/clear-data', (req, res) => {
  const data = res.locals.data;
  req.session.destroy();
  res.render('_admin/clear-data', { data: data });
});

module.exports = router;
