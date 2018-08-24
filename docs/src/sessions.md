# Managing sessions

The kit automatically tracks any data that is:

- Posted through a form or other means (e.g, JavaScript)
- Passed to a page through GET paramaters
- Added to the session through routing

Sessions are extremely useful because they only apply to _the user using the prototype_, meaning that multiple users can be interacting with the same prototype and will see different results based on their unique session data.

For example, you can use session data to store the data users enter into a form, to then change the way the form displays for that user only.

Session data is stored in the `data` variable, and is accessed by name, e.g: `data['my_session_variable']`.

## Setting up default session data

You can add default data to any users session using the `app/data/session.{json,yml,js}` file.

This will add any data found in the file to the session when the user first opens the prototype.

For example, you may want to add a `loggedIn` state to your prototype, and have it set to `false` by default:

In `app/data/session.json`:

```
{
    "loggedIn": false
}
```

This can then be accessed in any page or template as follows:

```
{% if data['loggedIn'] %}
    Congratulations, you're logged in!
{% endif %}
```

## Passing data between pages

Sessions are best used to pass data the user entered between pages. See ["Passing data between pages"](./passing-data.md) for more details.

## Modifying session data in routes

You can also modify your session data in your routes, to do server-side sanitization or to add new session data based on data you already have.

For example, let's say you want to display the users first name, but have only asked them to provide their full name in a form. You can separate their first and last name server-side, and add these back to the session:

```
module.exports = {
    "/form": (request, response, next) => {
        const fullName = response.locals.data['fullname']

        if (fullname) {
            const parts = fullname.split("")
            const firstName = parts[0]
            const lastName = parts[1]

            response.locals.data['firstname'] = firstName
            response.locals.data['lastname'] = lastName
        }

        next()
    }
}
```

## Managing multiple users

The best way to manage multiple users on a single computer is to use the _incognito_ or _private browsing_ mode of your browser. Each window you open in this mode will get a brand new session.

Multiple computers will each get their own session.

## Clearing data

To clear the current session data, simply navigate to http://localhost:9080/admin/_clear-data