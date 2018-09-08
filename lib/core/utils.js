const fs = require('fs');
const matter = require('gray-matter');
const path = require('path');
const portScanner = require('portscanner');
const prompt = require('prompt');
const spawn = require('cross-spawn');

/**
 * Resolves a relative path from project directory
 */
module.exports.getFromProject = config => relativePath => {
  const appDir = path.resolve(config.get('cwd'));
  const resolveApp = path.resolve(appDir, relativePath);

  return resolveApp;
};

/**
 * Resolves from app project
 */
module.exports.getFromApp = relativePath => {
  const appDir = path.resolve(fs.realpathSync(process.cwd()));
  const resolveApp = path.resolve(appDir, relativePath);

  return resolveApp;
};

/**
 * Installs provided dependencies using Yarn or NPM
 *
 * @param {String} dependencies A valid NPM dependency string
 */
module.exports.npmInstall = (dependencies, opts) =>
  new Promise((resolve, reject) => {
    const useYarn =
      fs.existsSync(module.exports.getFromApp('yarn.lock')) && !opts.ignoreYarn;
    const command = useYarn ? 'yarnpkg' : 'npm';
    let args = useYarn ? ['add'] : ['install', '--save'];

    args = args.concat(dependencies);

    const proc = spawn.sync(command, args, {
      stdio: opts.verbose ? 'inherit' : 'ignore',
      cwd: opts.cwd
    });

    if (proc.status !== 0) {
      reject(`${command} ${args.join(' ')} failed`);
    }

    resolve();
  });

/**
 * Finds available port for server; prompts user if default port is not
 * available
 *
 * @param {*} app
 * @param {*} callback
 */
module.exports.findAvailablePort = (port, opts, callback) => {
  const changePort = newPort => {
    port = newPort;
    fs.writeFileSync(module.exports.getFromApp('.port.tmp'), port);

    if (opts.verbose) {
      console.log('Changed to port ' + port);
    }

    callback(port);
  };

  // Make opts optional
  if (typeof opts === 'function') callback = opts;

  // Store port in tmp file
  try {
    port = Number(fs.readFileSync(path.resolve(process.cwd(), '.port.tmp')));
  } catch (e) {
    port = Number(process.env.PORT || port);
  }

  // Check port is free, else offer to change
  portScanner.findAPortNotInUse(
    port,
    port + 50,
    '127.0.0.1',
    (error, availablePort) => {
      if (error) throw error;

      if (port !== availablePort) {
        // Port in use - change to available port

        if (opts.verbose) {
          prompt.start();
          prompt.message = '';
          prompt.delimiter = '';

          console.error(
            'ERROR: Port ' +
              port +
              ' in use - you may have another prototype running.\n'
          );

          // Ask user if they want to change port
          prompt.get(
            [
              {
                name: 'answer',
                description: 'Change to an available port? (y/n)',
                required: true,
                type: 'string',
                pattern: /y(es)?|no?/i,
                message: 'Please enter y or n'
              }
            ],
            (err, result) => {
              if (err) throw err;

              if (result.answer.match(/y(es)?/i)) {
                // User answers yes
                changePort(availablePort);
              } else {
                // User answers no - exit
                console.log(
                  '\nYou can set a new default port in server.js, or by running the server with PORT=XXXX'
                );
                console.log("\nExit by pressing 'ctrl + c'");
                process.exit(0);
              }
            }
          );
        } else {
          changePort(availablePort);
        }
      }

      return callback(port);
    }
  );
};

/**
 * Attempts to load the req.path from static files
 *
 * @param {*} config
 * @param {*} reqPath
 * @param {*} res
 * @param {*} next
 */
module.exports.renderStaticPath = (config, reqPath, res, next) => {
  // Remove the leading slash, res.render won't work with it
  if (reqPath.startsWith('/')) {
    reqPath = reqPath.substr(1);
  }

  // Remove the trailing slash, as frontmatter won't work with it
  if (reqPath.endsWith('/')) {
    reqPath = reqPath.substr(0, reqPath.length - 1);
  }

  // If it's blank, render the root index
  if (reqPath === '') {
    reqPath = 'index';
  }

  res.render(reqPath, (error, html) => {
    if (!error) {
      // Success - send the response
      res.set({
        'Content-type': 'text/html; charset=utf-8'
      });
      return res.end(html);
    }

    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      return next(error);
    }

    if (!reqPath.endsWith('/index')) {
      // Maybe it's a folder - try to render [reqPath]/index.html
      return module.exports.renderStaticPath(
        config,
        reqPath + '/index',
        res,
        next
      );
    }
    // We got template not found both times - call next to trigger the 404 page
    next();
  });
};

/**
 * Retrieves front matter data from a req.path
 *
 * @param {*} config
 * @param {*} reqPath
 */
module.exports.getFrontmatterDataFromTemplate = (config, reqPath) => {
  let content = {};

  const realPath = path.join(config.get('dirs.views'), reqPath);

  if (fs.existsSync(realPath)) {
    fileContent = fs.readFileSync(realPath);
    content = matter(fileContent);
  }

  return content;
};

/**
 * Retrieves front matter data from a data file
 *
 * @param {*} config
 * @param {*} reqPath
 */
module.exports.getFrontmatterDataFromData = (config, dataFile) => {
  let content = {};
  const fileType = path.extname(dataFile);

  if (fs.existsSync(dataFile)) {
    fileContent = fs.readFileSync(dataFile);
    if (fileType === '.js') {
      content = matter(`---js\n${fileContent}\n---`);
    } else if (fileType === '.json') {
      content = matter(`---json\n${fileContent}\n---`);
    } else {
      content = matter(`---\n${fileContent}\n---`);
    }
  }

  return content;
};

/**
 * Get valid config args from schema
 *
 * @param {*} schema
 */
module.exports.getConfigArgs = (schema, parents = '') => {
  let args = {};

  Object.keys(schema.properties).forEach(key => {
    const item = schema.properties[key];

    if (item.properties) {
      parents = parents + `${key}.`;
      args = Object.assign(args, module.exports.getConfigArgs(item, parents));
    }

    if (typeof item.arg !== 'undefined') {
      const param = parents + key;

      args[param] = item;
    }
  });

  return args;
};
