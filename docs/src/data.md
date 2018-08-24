# Adding data to pages

You can add structured data to individual pages, groups of page, or all pages. This allows you to create <abbr title="Don't repeat yourself">DRY</abbr> prototypes that are much easier to maintain and iterate.

## Using front matter

All pages (files in `app/views`) with a `.html` or `.htm` extension support _front matter_.

Front matter is structured data in JSON, YAML, or even JavaScript langauges that is then made available to the Nunjucks templating language. It supports:

- Key-value pairs. A value with a unique identifier to access it.
- Arrays. Lists of values with a unqique identifier to access them.
- Objects. Groups of key value pairs with a unique identifier to access it.

For example, to add a title and description to your pages that you can reuse in your markup in multiple places:

### JSON

```
---
{
    "title": "Hello world!",
    "description": "I'm a real page now."
}
---
<html>
    <head>
        <title>
            {{ title }}
        </title>
    </head>
    <body>
        <h1>
            {{ title }}
        </h1>
        <p>
            {{ description }}
        </p>
    </body>
</html>
```

### YAML

```
---
title: Hello world!
description: I'm a real page now.
---
<html>
    <head>
        <title>
            {{ title }}
        </title>
    </head>
    <body>
        <h1>
            {{ title }}
        </h1>
        <p>
            {{ description }}
        </p>
    </body>
</html>
```

### JavaScript

```
---
{
    title: "Hello world!",
    description: "I'm a real page now."
}
---
<html>
    <head>
        <title>
            {{ title }}
        </title>
    </head>
    <body>
        <h1>
            {{ title }}
        </h1>
        <p>
            {{ description }}
        </p>
    </body>
</html>
```

> Note: Javascript exclusively supports functions. This allows you to add Javascript to your page that can do pretty cool stuff!
>
> For example:
> ```
> ---
> {
>   switchAToB: (val) => val.replace('a', 'b')
> }
> ---
> ```

## Using local data files

Local data files allow you to apply data to all _sibling_ and _child_ pages. They work by placing a file named `data` alongside any pages you wish to have data applied to.

Local data files can be in JSON, YAML, and Javascript files. I.e, `data.json`, `data.yml`, or `data.js`

For example, let's say we wanted to make certain content available to _all_ pages in the `app/views/help` folder. We would add `app/views/help/data.yml`:

```
contact:
    email: contact@example.com
    phone: 1 902 123-4567
```

Which would look like:

```
|- app/
|-- views/
|---- index.html
|----- help/
|------ data.json
|------ index.html
|------ support.html
```

Now both `app/views/help/index.html` and `app/views/help/support.html` will have access to `contact.email` and `contact.phone`.

## Using global data files

Global data files allow you to apply data to _all pages_ in the `app/views` folder. They work by creating files in the `app/data` folder. Then the data will be accessible in every page using the name of the file.

They are extremey useful for adding data for production environments to your prototype, by allowing you to add data from developer-friendly standards like JSON and YAML.

Local data files can be in JSON, YAML, and Javascript files.

For example, if you create `app/data/site.json`:

```
{
    "title": "MY_PROTOTYPE_TITLE",
    "description": "MY_PROTOTYPE_DESCRIPTION"
}
```

This can now be access under the `site` variable in your pages:


```
---
{
    "title": "Hello world!",
    "description": "I'm a real page now."
}
---
<html>
    <head>
        <title>
            {{ title }} - {{ site.title }}
        </title>
    </head>
    <body>
        <h1>
            {{ title }}
        </h1>
        <p>
            {{ description | default(site.description) }}
        </p>
    </body>
</html>
```

## Data cascade

Data cascades in your pages, with more specific data overriding less specific. The cascade currently is:

- Load global data files
- Load local data files, overwrite any data provided by global data files if there is a conflict
- Load data from custom routes, overwrite any data provided by local data files if there is a conflict
- Load front matter, overwrite any data provided by custom routes if there is a conflict