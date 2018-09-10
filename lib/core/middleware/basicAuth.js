const basicAuth = require('basic-auth');
const debug = require('debug')('pkit:middleware:basicAuth');

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'))
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */

module.exports = (name, password) => {
  return function(req, res, next) {
    const auth = basicAuth(req)
    
    if (!name || !password) {
      const isNameSet = typeof name !== undefined
      const isPasswordSet = typeof password !== undefined

      debug('Is username is set: %s', isNameSet);
      debug('Is password is set: %s', isPasswordSet);

      return res.render('_admin/auth-misconfigured.html')
    }

    if (!auth) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    if (auth.name !== name || auth.pass !== password) {
      res.render('_admin/auth-failed.html', { path: req.path }, (error, html) => {
          if (!error) {
            res.set({
              'Content-type': 'text/html; charset=utf-8',
              'WWW-Authenticate': 'Basic realm=Authorization Required'
            });
            res.status(401);
      
            return res.end(html);
          }

          next(error);
      })
    } else {
      next();
    }
  };
};
