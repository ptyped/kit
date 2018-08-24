# Updating the kit

The kit will automatically notify you if a new version is available when you start your development server.

When an update is available, you have to update the kit in _two places_:

- The global CLI used to create new projects
- The kit version used by each prototype

This is because you _not_ want your prototype to use the latest version of the kit, or the kit starter, if they were breaking changes made to either.

## Updating the CLI

Updating the CLI is extremely straightforward. Simply run the following from your terminal:

```
npm update -g @ptyped/kit
```

## Updating the kit in your prototype(s)

Updating the version of the kit in your prototype requires you to navigate to your prototype folder in your terminal:

```
cd ~/prototypes/my-prototype
```

> We're assuming you add your prototypes to a `prototypes/` folder in your user directory, as outlined in our [installation guide](./installation.md)

Then you can run:

```
npm update @ptyped/kit
```

If you would like to update the starter used by the project, you can also run:

```
npm update
```