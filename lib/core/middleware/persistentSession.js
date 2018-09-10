const nedb = require('nedb-session-store');
const session = require('express-session');

const { getFromProject } = require('../utils');
const pkg = require('../../../package.json');
const secret = pkg.name;
const store = nedb(session);

module.exports = config => {
  const sessionOpts = {
    secret: secret,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    cookie: {
      maxAge: 1000 * 60 * 60 * 3 // 3 hours
    },
    store: new store({
      filename: getFromProject(config)('.session.tmp')
    })
  };

  return session(sessionOpts);
};
