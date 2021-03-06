const merge = require('webpack-merge');

const { getFrontmatterDataFromData } = require('../utils');

/**
 * Enables storing data posted to the express server for usage
 * with server-side nunjucks
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

module.exports = (config, sessionFile) => (req, res) => {
  const fmt = getFrontmatterDataFromData(config, sessionFile);
  const sessionDefaults = fmt.data

  if (!req.session.data) {
    req.session.data = {};
  }

  req.session.data = merge({}, sessionDefaults, req.session.data);

  storeData(req.body, req.session);
  storeData(req.query, req.session);

  res.locals.data = {};

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j];
  }

  return res
};

// Store data from POST body or GET query in session
var storeData = function(input, store) {
  for (var i in input) {
    // any input where the name starts with _ is ignored
    if (i.indexOf('_') === 0) {
      continue;
    }

    var val = input[i];

    // Delete values when users unselect checkboxes
    if (val === '_unchecked' || val === ['_unchecked']) {
      delete store.data[i];
      continue;
    }

    // Remove _unchecked from arrays of checkboxes
    if (Array.isArray(val)) {
      var index = val.indexOf('_unchecked');
      if (index !== -1) {
        val.splice(index, 1);
      }
    }

    store.data[i] = val;
  }
};
