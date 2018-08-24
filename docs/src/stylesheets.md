# Writing CSS

The kit comes with built-in support for authoring custom CSS and/or SCSS for your prototypes.

All CSS/SCSS should be stored in `app/assets/css`.

## Using CSS

CSS is processed using PostCSS, and allows you to use modern CSS features today such as:

- CSS variables
- CSS functions
- Automatic vendor prefixing; no need to worry about writing `-webkit`, etc....
- Automatic legacy browser support; no need to worry about converting RGBA values for old browsers, etc...
- and more...

Any file found in the `app/assets/css` folder with a `.css` extension will be processed by the kit and output with the same name to the `public` folder.

For example, if you created `app/assets/css/index.css` it would be available in your prototype at `/public/index.css`.

## Using SCSS

SCSS is processed using Sass, and then run through PostCSS for:

- Automatic vendor prefixing; no need to worry about writing `-webkit`, etc....
- Automatic legacy browser support; no need to worry about converting RGBA values for old browsers, etc...


Any file found in the `app/assets/css` folder with a `.scss` extension will be processed by the kit and output as a `.css` file with the same name in the `public folder`.

For example, if you created `app/assets/css/index.scss` it would be available in your prototype at `/public/index.css`.

## SCSS & CSS priority

CSS files takes priority over SCSS files, so if an `index.scss` file and `index.css` file both exist in `app/assets/css` only the `index.css` file will be added to `public`.