# Installation

Get up and running with the kit in **5 to 30** minutes, depending on your level of expertise.

## Software you will need

Before you can get started with the kit, you _must_ Nodejs installed, and it is highly recommended to have Git installed.

- Administrative access on your computer
- [Download NodeJS installer](https://nodejs.org/en/download/)
- [Download Git installer](https://git-scm.com/downloads)
- An text editor; [Visual Studio Code](https://code.visualstudio.com/download) is recommended
- Command line tools (MacOS)
- Git bash (Windows)

### Administrative access

The software requirements above will install software to the root of your system, meaning you need full administrative access on your computer to do so.

### Terminal

You'll need a terminal application to install, start, and stop the kit. For the purposes of this guide, we'll assume you've chosen to use Visual Studio Code, which has an integrated terminal.

This terminal can be opened by pressing <key>ctrl</key> + <key>`</key> in Visual Studio Code.

If you have not installed Visual Studio Code, you can:

- Use `terminal.app` on MacOS
- Use Git Bash on Windows (comes with Git when installed)
- Use the built-in terminal in your Linux distribution

### NodeJS LTS

Please use the Node <abbr title="Long term support">LTS</abbr> for best possible support.

#### Check if Node is installed

Before attempting to install Node, make sure it isn't already available by running:

```
node -v
```

If it says `command not found`, then proceed to install Node. If it says a version lesser than `8.x.x` is installed, please download and install a newer version of Node.

### Git

Git will allow you to keep a history of all changes you make to your prototype, and roll back to an earlier version if you learn a change was undesirable.

For Windows users, you also get Git bash, which gives you a terminal experience extremely similar to MacOS and Linux.

### Command line tools (MacOS)

Mac users will need the MacOS/Mac OSX command line tools. In your terminal run:

```
xcode-select --install
```

If the command line tools are already installed, you will see `xcode-select: error: command line tools are already installed, use "Software Update" to install updates`. Otherwise, the installer will run.

## Download the kit

The kit is a <abbr title="Command line interface">CLI</abbr> or terminal tool. The easiest way to download is to run:

```
npm install -g @ptyped/kit
```

> The `-g` option means `global`, which installs the CLI to be available to your entire computer

## Choose a location to store your prototype(s)

Next, decide where you'd like to keep your prototypes. We recommend a `prototypes` folder in your user folder, which can easily be created by running:

```
mkdir ~/prototypes
```

The `~` tilde means "my user directory". This is usually where your account's documents, photos, music, and more are stored by default.

## Create your first prototype

Now, navigate to your new `prototypes` folder by running:

```
cd ~/prototypes
```

> `cd` means "Change directory"

Then create your first prototype by running the following (be sure to change `my-prototype` to a descriptive name for your prototype):

```
pkit init my-prototype --template ptyped-kit-starter
```

> Want to use a different starter template? See all the starters available on NPM, and use a different starter by replacing `ptyped-kit-starter` with the name of the starter you'd like.

And then navigate to the new prototype folder and start the development server by running:

```
npm start
```

Once the server is ready, it will tell you what URL you can access your prototype from. Usually this is [http://localhost:9080](http://localhost:9080).

## Stopping development

To stop development, you can press <key>ctrl</key> + <key>c</key> to end the process, or simply just close your terminal.

## All done!

Your installation and first prototype is ready. Get to work!