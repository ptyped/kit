# Basic usage

## Using the <abbr title="Command line interface">CLI</abbr>

The CLI will allow you to create new projects, run the development server, build your project assets, and more.

To get a full list of available options, run the following from your terminal:

```
pkit --help
```

## Choosing a starter

Out of the box, the kit will create new projects using [ptyped-kit-starter](https://github.com/ptyped/ptyped-kit-starter). This starter comes with:

- TailwindCSS for DRY, atomic wireframing and visual design
- Autoprefixed CSS & SCSS; you don't need `-webkit` or other prefixes.
- Automatic backwards-compatible CSS support with Laggard; don't worry about legacy browsers.
- Modern Javascript supporting Nodejs require, ES6 syntax and imports, and more.

However, you can use a variety of [available starters](https://www.npmjs.com/search?q=ptyped-kit-starter) or even [create your own](./templates.md).

## Creating assets

The kit _always_ supports modern CSS, SCSS, and Javascript no matter what starter you use.

- [Writing css](./css.md)
- [Writing javascript](./javascript.md)

## Running a local copy of these docs

This kit is designed to be _totally_ offline friendly for development once it's installed. That means even the documentation is available offline.

Simply run:

```
pkit docs
```

The documentation will be generated and made available at a local URL. Usually this is [http://localhost:10000](http://localhost:10000).