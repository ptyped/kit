# Passing data between pages

You may want to store or display data that has been entered over many pages of the prototype, or change your prototype based on how people interact with it.

This kit automatically stores data entered into it, and also allows you to manipulate this data.

## Using query params

Any query paramaters (also known as `GET` params) will be available in your template. This will overwrite whatever [session data](./session.md) was already stored for the value.

Query paramaters are formatted as follows:

```
http://localhost:9080/form?key=value&key2=value2
```

In this example:

- `?`: tells the kit that everything after the question mark is query params
- `key`: is the unique key you want to access the variable from. I.e, in this example it would be `{{ data['key'] }}`
- `=`: tells the kit that everything after the equal sign is the value
- `value`: is the value that will be output in your pages & templates when you access the variable
- `&`: tells the kit that another variable as after the ampersand, and to treat everything after as the key.

For example, lets say you wanted to add basic state to a page, you could do this using query paramaters:

### How to use

You can add query params by simply adding them to any anchor tag, e.g:

```
<a href="/help?online=true">Get help</a>
```

## Forms

Any data entered into a form input with a `name` attribute is saved in the `data` key when the form is submitted and made available to _all pages_.

Simply add an `action` attribute to your form to either:

- The same url
- The URL you would like the user to go to after submitting the form

For example, if you had a simple form at `app/views/help` whose action was its own url:

```
<form action="/help" method="POST">
    <label for="fullName">Full name</label>
    <input type="text" name="fullName" id="fullName">
    <label for="fullName">Email</label>
    <input type="text" name="email" id="email">
    <label for="message">Message</label>
    <textarea name="message" id="message"></textarea>
</form>
```

You can then update the form's markup to allow it to display the information the user enters:

```
<form action="/help" method="POST">
    <label for="fullName">Full name</label>
    <input type="text" name="fullName" id="fullName" value="{{ data['fullName'] }}>
    <label for="fullName">Email</label>
    <input type="text" name="email" id="email" value="{{ data['email'] }}>
    <label for="message">Message</label>
    <textarea name="message" id="message">{{ data['message'] }}</textarea>
</form>
```

## Ajax data

You can also add data to the session without refreshing the page using Ajax or the Fetch API. This can be useful for building session data for later pages through an interactive interface.

This is out of the scope of this guide, so see the following resources:

- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX
- http://api.jquery.com/jquery.ajax/

## Clearing data

To clear the current session data, simply navigate to http://localhost:9080/admin/_clear-data