# Creating routes and redirects

In order to create prototypes that are truly representative of the applications, websites, and systems you're designign for, you may want to execute logic based on user input and behaviour that change how your prototype behaves.

All routes and redirects are handled by placing a `routes.js` file in the `app/views` folder. Like [local data files](./data.md#using-local data-files), route files apply to any _sibling_ pages or child pages in directories.

To do this, you must create individual _routes_ or _paths_ for pages.

For example, for the route `/form` the following URL is used:

```
http://localhost:9080/form
```

A `routes.js` file maps routes or paths to a Javascript function that tells the kit what to render:

```
module.exports = {
    "route": callback(request, response, next) => {
        response.render(page, data)
    }
}
```

The above breaks down as follows:

- `module.exports`: tells the kit that anything inside this variable should be loaded as a route
- `"route"`: the route (or path) you want the function to apply to
- `callback`: the function that is called with the URL requested matches the route
- `request`: an object representing the HTTP request made by the user
- `response`: an object representing the HTTP response the kit will be send back
- `response.render`: a function that tells the kit to render a template from `app/views`
- `page`: the file name of a page found in `app/views`. E.g, `index.html`
- `data`: a object representing any additional data you want to provide the page

## Redirects

Redirects allow you to map one URL to another. This is useful if you need to update an existing prototype and are removing pages or renaming pages, and need to have the old URLs go to the new URLs.

For example, you may build a form prototype at `app/views/form.html` and then learn that you need more than one form, and move this and other forms to `app/views/forms/form1.html`.

In order to have the path `/form` still load your page, you can create a redirect from `/form` to `/forms/form1`:

In `app/views/routes.js`:

```
module.exports = {
    "/form" => "/forms/form1"
}
```

### Branching

Branching allows you to create complex logic for handling how the prototype will navigate.

Imagine you have a multi-step form where some pages should only show depending on how the user answered questions on previous steps. Using the session data stored by the kit, we can easily do this.

For example, let's say in `app/views/form.html` we have the following:

```
<form action="/form" method="POST">
    <label for="over18">
        <input type="checkbox" name="over18" id="over18">
    </label>
    <button type="submit">Continue</button>
</form>
```

If the `over18` checkbox is checked, we want to send them to `/success`, otherwise send them to `/fail`. We can do this in `app/views/routes.js`:

```
module.exports = {
    "/form": (request, response, next) => {
        const isOver18 = response.locals.data['over18'] === "on"

        if (isOver18) {
            res.redirect('/success')
        } else {
            res.redirect('/fail)
        }
    }
}
```

Let's break this down:

- `const isOver18`: a Javascript constant that stores a `boolean` (true or false) value on whether or not the checkbox was checked
- `response.locals.data['over18`]:
  - `response.locals`: we can access all of the data available to a page from this variable.
  - `data`: the session data
  - `['over18']`: the `name` attribute of the checkbox input
- `res.redirect`: a function that tells the prototype to send the user to the route provided.

---

We can also change the _page_ rendered without changing the route or path. Using the same example, we can dynamically change what template `/forms` renders so that in renders the form if the checkbox was not checked, or a success template if it has been:

```
module.exports = {
    "/form": (request, response, next) => {
        const isOver18 = response.locals.data['over18'] === "on"

        if (isOver18) {
            res.render('success.html')
        } else {
            res.render('form.html)
        }
    }
}
```

### Dynamic data

Sometimes we need to add more information or change a a page based on things like:

- What data we've added to a page
- What data has been passed in through query paramaters
- What data has been entered by a user

Instead of adding complex Nunjucks code to your templates and pages, you can do this in routes.

Lets say we want to respond to the submission of a form by making sure the data makes sense, and warn the user if it doesn't. This _could_ be done with custom Javascript, but that can make your pages needlessly complex and hard to maintain.

Instead, you can check the data at the route level, and then return information to the page to display to the user.

In `app/views/form.html`:

```
{% if error %}
<h1>{{ error.title }}</h1>
<p>{{ error.message }}</p>
{% endif %}
<form action="/form" method="POST">
    <label for="over18">
        <input type="checkbox" name="over18" id="over18">
    </label>
    <button type="submit">Continue</button>
</form>
```

Here we've added a conditional to check for an `error` variable, and display an error to the user if it exists.

In `app/views/routes.js`:

```
module.exports = {
    "/form": (request, response, next) => {
        const over18 = response.locals.data['over18']
        const isOver18 = response.locals.data['over18'] === "on

        if (!isOver18) {
            const error = {
                title: "You must be over 18",
                description: "You cannot submit this form if you are not over 18 years of age"
            }

            res.render('form.html', {error: error})
        }
    }
}
```

Here we retreived the `over18` value from `request.locals.data`. If the data indicates the checkbox hasn't been checked, we setup an error and then tell the `response` to render `form.html` again with the error.

> Note: you can pass whatever data you'd like to a route when using `response.render`. However, this data will be overwritten by any conflicts found the in page's [front matter](./data.md#using-front-matter).