# p(roto)Typed Kit

Create realistic, state-driven HTML prototypes with zero-configuration.

pType kit works on MacOS, Windows, and Linux.

If something doesn't work 👎, please [create an issue](https://github.com/ptype/kit/issues/new).

## Quick start

```
npm install -g @ptyped/kit
pkit init my-prototype
cd my-prototype
npm start
```

Then open [http://localhost:9080/](http://localhost:9080/) to see your new prototype.

## How do I update to new versions?

To update the version used by a specific project, run the following from the project root:

```
npm update @ptype/kit
```

To update the cli used to bootstrap new projects, run the following:

```
npm update -g @ptype/kit
```

## Philosophy

- **One dependency**: there is just one dependency to manage. It uses Express, Webpack, Babel, Sass, Postcss, and other amazing products to give you a fast, modern prototyping experience with zero overhead.

- **No configuration required**: you don't need to configure anything. Reasonably good configuration is handled for you so you can focus on your prototype & interaction design.

> Protip: need a custom build config, custom dependencies (e.g, bootstrap) or something else? We've got you covered. Create a custom "project template" for your whole team to re-use.

## What's included?

You will have everything you need to start rapidly prototyping a new web product, website, or web thing™️:

- Static HTML with Nunjucks templating
- TailwindCSS for DRY, atomic wireframing/visual design
- Front matter support for page data modelling
- Data file support for DRY data modelling
- Routing support for easy interaction design
- Autoprefixed CSS & SCSS; you don't need `-webkit` or other prefixes.
- Modern Javascript supporting `require`, `import` and more.
- A live development server that reloads when you make changes, and synchronizes behaviour across multiple tabs, browers, and devices.
- Hassle-free updates for all of the above through a single dependency.

## Popular alternatives

pType Kit is a good fit for:

- **Building interactive prototypes** that have state, such as prototypes of web apps, mobile apps, websites, and more.
- **Teams that need consistency across many prototypes**. If you create many prototypes, or have many different teams, pType Kit allows you to provide a great framework for them.
- **Prototyping with React/Vue/Web components** is not a problem! Unless you need to build a PWA, pType kit is probably easier to work with.

However, there are cases where something else may be a better fit:

- If you're experimenting with HTML, CSS or JavaScript then [CodePen](http://codepen.io/) will get you up and running more quickly.
- If you're prototyping a **simple website** without any state, then you may be better off with a [static site generator](https://www.netlify.com/blog/2017/05/25/top-ten-static-site-generators-of-2017/).
- If you're building a library of React/Vue/Web components, you should likely use a framework like [nwb](https://github.com/insin/nwb) or [StencilJs](http://stenciljs.com/)

## Contributing

We support _any_ and _all_ contributions, whether it's code, documentation, design, guides, or anything else.

## Acknowledgements

We are greatful to the following authors and existing projects for their inspiration, ideas, and collaboration:

- [ThinkingBig](http://thinkingbig.net/)
- [Create React App](https://github.com/facebook/create-react-app)
- [Zack Leatherman](https://github.com/zachleat)
- [GOVUK Prototype Kit](https://github.com/alphagov/govuk-prototype-kit)
