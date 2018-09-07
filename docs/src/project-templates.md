# Project templates

The kit uses project templates to initialize new prototypes.

Out of the box, the kit uses [ptyped-kit-starter](https://github.com/ptyped/ptyped-kit-starter).

## Creating a template

To create a template, you must either:

- Create an NPM package
- Create a Git repository accessible by your team

## Installing a kit

When running `pkit init` you can pass the `--template` option to use a different template than the starter.

You are able to use the following:

- The name of an NPM module: e.g, `ptyped-kit-starter`
- The username and repsitory to a publically accessible Github repository: `username/repository`, e.g, `ptyped/ptyped-kit-starter`
- Shorthand syntax for `GitHub`, `Gitlab`, or `Bitbucket`: `provider:username/repository`, e.g, `github:ptyped/ptyped-kit-starter`
- The full path to a Git repository: e.g, `https://github.com/ptyped/ptyped-kit-starter.git`

For example:

```
pkit init --template=ptyped/ptyped-kit-starter
```

### Notes for private NPM packages or Git repository

Private packages and repositories require that your machine has been setup to access the private repository. Either by authenticating with NPM using `npm login` or adding the correct SSH credentials.

## Creating a template

To create a template, you'll need the following directory structure:

```
src/                 => All files to be copied into the project
  app/               => The prototype's application files
  public/            => Where any static files go
.kit.js              => The templates's configuration file
package.json         => Contains the template's name, version, and dependencies
```

### The `src` directory

Everything in the `src/` directory is copied as-is to the project folder when running `pkit init`, and anything that does not already exist in the project is copied as-is to the project folder when running `pkit update`.

This allows you to bootstrap new prototypes from a sane starting type every time, and:

- Allows common templates, dependencies, static files, and project configurations to be created for each prototype without having to worry about merge conflicts in Git, or keeping every prototype in-sync.
- Allows project templates to be semantically versioned, so that prototypes can stay frozen in time.
- Makes updating common templates, dependencies, static files, and project configurations easy and automatic.

## The `.kit.js` file

The `.kit.js` file handles configuration for the project template. It allows you to customize how the kit processes Javascript with Webpack, the Sass configuration, and the PostCSS configuration.

The options are:

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| `ip` | The IP address the Kit will bind to | `String` | `127.0.0.1` |
| `port` | The port the Kit should _try_ to bind to if available | `Number` | `9080` |
| `dependencies` | Any third party dependencies the kit should load into the project. [See syntax below](#dependencies). | `Array[string]` | `[]` |
| `configureWebpack` | Configure webpack by passing a valid webpack configuration object | `Object` | `{}` |
| `configureSass` | Configure `.scss` builds by passing a valid node-sass configuration object | `object` | `{}` |
| `configurePostcss` | Configure `.css` builds by passing a valid PostCSS configuration | `object|function` | `{}` |
| `configurePostcssAfterSass` | Configure the PostCSS builds ran on `.scss` files after they have been processed by node-sass | `object|function` | `{}` |
| `publicPath` | The path that static files are served from | `String` | `/public` |
| `dirs.input` | The directory all other directories are located | `String` | `app` |
| `dirs.views` | The directory that pages and templates are located | `String` | `views` |
| `dirs.data` | The directory that global data files are located | `string` | `data` |
| `dirs.assets.js` | The directory containing Javascript to be compiled | `String` | `assets/js` |
| `dirs.assets.css` | The directory containing `.css` files to be compiled | `String` | `assets/css` |
| `dirs.assets.scss` | The directory containing `.scss` files to be compiled | `String` | `assets/css` |
| `dirs.static` | The directory that static files are located | `String` | `../public` |
| `dirs.dependencies` | The directory that dependencies are located | `String` | `../public/.dependencies` |

### Dependencies

Depenedencies are downloaded to a `.dependencies` folder in the `static` folder. Dependencies support the following syntaxes:

- **Publically accessible files:** any publically accessible URL to a file can be used, and will be downloaded to the project with the same filename.
- **Git URLs**: any Git project accessible by your team can be used, using shorthand syntax or the full direct URL. Branches, tags, and releases can be specified using a `#` symbol. E.g, `github:ptyped/kit-starter-default#master`
- **Local files**: local files and folders can be used by using the `file:` prefix. E.g, `file:/path/to/file_or_folder`

## Template gotchas, tips and tricks

### Using Git repositories

When using Git repositories as a template, the repositories name _must_ match the name of the template defined in `package.json`.

For example, if the repository is named `ptyped-kit-starter` then `package.json` should look like:

```
{
  name: "ptyped-kit-starter",
  version: "x.x.x"
}
```

