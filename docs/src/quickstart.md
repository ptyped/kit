# Quick start

If you're already familiar with NodeJs, NPM, Git and related software, see below.

If not, we recommend you follow the full [installation guide](./installation.md).

```
npm install -g @ptyped/kit
pkit init my-prototype --template ptyped-kit-starter
cd my-prototype
npm start
```

Then open [http://localhost:9080](http://localhost:9080) to see your new prototype.

> Want to use a different starter template? See all the starters available on NPM, and use a different starter by replacing `ptyped-kit-starter` with the name of the starter you'd like.

## How do I update to new versions?

To update the version used by a specific project, run the following from the project root:

```
npm update @ptyped/kit
```

To update the cli used to bootstrap new projects, run the following:

```
npm update -g @ptyped/kit
```