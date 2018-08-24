# Writing JavaScript

The kit comes with built-in support for authoring modern ES6 JavaScript using Webpack.

You'll probably need to write JavaScript for your prototype at some point, to add interactivity to your pages.

For example, you'll want to show or hide elements on a page based on how the user interacts with it.

All JavaScript should be stored in `app/assets/js` with a `.js` extension.

## Using JavaScript

JS is processed using Webpack and Babel, and allows you to use modern JS features today such as:

- Javascript constants (`const`) and block scoped variables (`let`)
- Javascript modules
- Exporting functions, variables, and more from files
- Shorthand arrow functions
- Template literals
- [and more...](https://github.com/lukehoban/es6features)

For example, if you created `app/assets/js/index.js` it would be available in your prototype at `/public/index.js`.

## Using modules

Javascript modules allow you to separate your code into logical chunks that are easier to understand and maintain, and that can be reusable.

They work by using the `require()` function or the `import` statement. For our purposes, we'll use the `import` statement as it is easier to understand:

For example, let's say we wanted to create a separate Javascript file to handle the interaction logic for each step of a form:

In `app/assets/js/index.js`:

```
import step1 from "./imports/step1"
import step2 from "./imports/step2"

step1()
step2()
```

Here we're:

- Telling our `index.js` file to import the files `app/assets/js/imports/step1.js` and `app/assets/js/imports/step2.js` as variables named `step1` and `step2` respectively.
- Then we're executing the logic in 

Then in `app/assets/js/imports/step1.js`:

```
export default step1 () => {
    alert(`You're using 'app/assets/js/imports/step1.js`)
}
```

And in `app/assets/js/imports/step2.js`:

```
export default step1 () => {
    alert(`You're using 'app/assets/js/imports/step2.js`)
}
```

## Javascript variables

The kit allows you to use the following variable types:

- *Constant*: a variable that cannot be changed. The kit will throw an error if you try to change a constant. E.g, `const red = "red"`
- *Block-scoped variable*: a variable that can only be access within the scope (e.g, a function) it was defined in, _after_ it was defined. E.g, `let loggedIn = true`
- *Global-scoped variable*: a variable that can be accessed anywhere _after_ it has been defined. E.g, `var loggedIn = true`

### More examples

```
const red = "red"

red = "blue" // this will throw an error
```

```
let loggedIn = true

console.log(loggedIn) // will log `true`
```

```
let loggedIn = false

function isLoggedIn() {
    let loggedIn = true
    console.log(loggedIn) // will be `true`
}

console.log(loggedIn) // will be `false`
isLoggedIn()
console.log(loggedIn) // will be `false`
```

```
var loggedIn = false

function isLoggedIn() {
    loggedIn = true
}

console.log(loggedIn) // will be `false`
isLoggedIn()
console.log(loggedIn) // will be `true`
```

## Learn more

[Learn more about ES6](https://github.com/lukehoban/es6features)