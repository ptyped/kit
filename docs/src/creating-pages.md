# Creating pages

Any pages found in the `app/views` folder will be available in your prototype. 

All pages must have a `.html` or `.htm` extension.

For example, if you add a page called `help.html`, it will be available at [http://localhost:9080/help](http://localhost:9080/help).

Folders also work, so you can make the page `views/help/contact.html` and it will be available at [http://localhost:9080/help/contact](http://localhost:9080/help/contact).

## Dynamic pages with Nunjucks

You can make your pages dynamic by using Mozilla's [Nunjucks templating language](https://mozilla.github.io/nunjucks/).

It allows you to create <abbr title="Don't repeat yourself">DRY</abbr> pages by allowing you to not repeating content or markup that appears in more than once place in your pages.

### <abbr title="Don't repeat yourself">DRY</abbr> content

Leeping your content DRY (because your stakeholders will _hate_ when you mess up their requirements 🙈) is extremely important. You can write content once, and use it everywhere.

For example, instead of:

```
<html>
    <head>
        <title>
            Hello world page
        </title>
    </head>
    <body>
        <h1>
            Hello world page
        </h1>
        <p>
            Welcome to my new prototype!
        </p>
    </body>
</html>
```

You can write:

```
---
title: Hello world page
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
            Welcome to my new prototype!
        </p>
    </body>
</html>
```

Which would result in the exact same html.

### <abbr title="Don't repeat yourself">DRY</abbr> markup

Just as important as keeping your content <abbr title="Don't repeat yourself">DRY</abbr>, you need to keep your markup <abbr title="Don't repeat yourself">DRY</abbr>.

Imagine creating a list of items. Instead of writing:

```
...
<ul class="bg-white border border-grey-light border-solid list-reset rounded">
    <li class="flex px-4 ph-2">
        <span>Option 1</span>
        <button class="bg-blue text-white font-semibold px-4 py-2 rounded">Select</button>
    </li>
     <li class="flex px-4 ph-2">
        <span>Option 2</span>
        <button class="bg-blue text-white font-semibold px-4 py-2 rounded">Select</button>
    </li>
     <li class="flex px-4 ph-2">
        <span>Option 3</span>
        <button class="bg-blue text-white font-semibold px-4 py-2 rounded">Select</button>
    </li>
</ul>
...
```

You can write:

```
---
options:
    - title: Option 1
    - title: Option 2
    - title: Option 3
---
...
<ul class="bg-white border border-grey-light border-solid list-reset rounded">
    {% for option in options %}
    <li class="flex px-4 ph-2">
        <span>{{ option.title }}</span>
        <button class="bg-blue text-white font-semibold px-4 py-2 rounded">Select</button>
    </li>
    {% endfor %}
</ul>
...
```

## Page templates/layouts

If you find yourself repeating the same markup over, and over, and over again, you're probably ready for page templates/layouts.

For example, creating a bunch of forms using the same design? Stop repeating the layout of the forms in each page by creating a template.

Templates work by providing `blocks` that pages can place their content inside of. Pages then `extend` templates. Templates _must_ have the `.njk` extension.

For example, we create `app/views/form.njk`:

```
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
        <div class="bg-white border border-grey-light border-solid list-reset rounded px-4 py-3">
            {% block form %}
                <p>Woops, it looks like you forgot to fill out the <code>form</code> block. Better fix that!
            {% endblock %}
        </div>
    </body>
</html>
```

We can than `extend` that template in one of our form pages and use the `form` `block` to drop our form inputs into this template:

```
---
title: My awesome form
---
{% extends 'form.njk' %}

{% block form %}
    <fieldset>
        <legend>Address</legend>
        <label for"address1">Address line 1</label>
        <input type="text" id="address1" name="address1" placeholder="Enter your street name and number">
        <label for="address2">Address line 2</label>
        <input type="text" id="address2" name="address2" placeholder="Enter your apartment or unit number (if applicable)">
    </fieldset>
{% endblock %}
```

Which will output:

```
<html>
    <head>
        <title>
            My awesome form
        </title>
    </head>
    <body>
        <h1>
            My awesome form
        </h1>
        <div class="bg-white border border-grey-light border-solid list-reset rounded px-4 py-3">
            <fieldset>
                <legend>Address</legend>
                <label for"address1">Address line 1</label>
                <input type="text" id="address1" name="address1" placeholder="Enter your street name and number">
                <label for="address2">Address line 2</label>
                <input type="text" id="address2" name="address2" placeholder="Enter your apartment or unit number (if applicable)">
            </fieldset>
        </div>
    </body>
</html>
```

## Page partials (or components)

What if you have markup that's repeating a lot, but doesn't really make sense as a template or layout? Fear not, that's what partials are for!

Partials _must_ have the `.njk` extension.

For example, lets say you put the same breadcrumb markup in multiple pages, with different templates. You can put that markup in a single file, and include it in all of those pages and templates.

In `app/views/breadcrumbs.njk`:

```
<nav class="bg-grey-light p-3 rounded font-sans w-full m-4">
  <ol class="list-reset flex text-grey-dark">
    <li>
        <a href="#" class="text-blue font-bold">Home</a>
    </li>
    <li>
        <span class="mx-2">/</span>
    </li>
    <li>
        <a href="#" class="text-blue font-bold">Library</a>
    </li>
    <li>
        <span class="mx-2">/</span>
    </li>
    <li>
        Data
    </li>
  </ol>
</nav>
```

And then in our form template (`app/views/form.njk`) or any page:

```
...
{% include 'breadcrumbs.njk' %}
...
```

We can even take this one step further and make the _content of our partial configurable!

Back in `app/views/breadcrumbs.njk`:

```
{% if breadcrumbs %}
<nav class="bg-grey-light p-3 rounded font-sans w-full m-4">
  <ol class="list-reset flex text-grey-dark">
  {% for crumb in breadcrumbs %}
    {% if not loop.last %}
    <li>
        <a href="{{ crumb.url }}" class="text-blue font-bold">{{ crumb.title }}</a>
    </li>
    <li>
        <span class="mx-2">/</span>
    </li>
    {% else %}
    <li>
        {{ crumb.title }}
    </li>
    {% endif %}
  {% endfor %}
  </ol>
</nav>
{% endif %}
```

And then back in our page:

```
---
breadcrumbs:
 - title: Home
   url: /
 - title: Data
   url: /data
---
...
{% include 'breadcrumbs.njk' %}
...
```

## Futher techniques

To learn more, please see the [Nunjucks templating docs](https://mozilla.github.io/nunjucks/templating.html).