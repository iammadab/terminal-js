# terminal-js
Declaratively build nodejs command line tools
## Installation
```javascript
npm install @iammadab/terminaljs
```
## Quick Start
Since most people are familiar with the git command line, lets recreate the push, pull, add and commit commands

Lets go through the commands to figure out what we need
```
  push
    git push <remote> <branch> (git push origin master)
 
  pull
    git pull <remote> <branch> (git pull heroku master)
    
  add
    git add <repoLocation> (git add .)
    
  commit
    git commit [-m (message)] (git commit -m "first commit")
  
 ```
Now that we know what our command need to work we can now create the cli

```
let terminal = require("@iammadab/terminaljs")

//Delcare your commands 

terminal.use({
  commands: {
    push: ["remote", "branch"],
    pull: ["remote", "branch"],
    add: ["repoLocation"],
    commit: ["-m"]
  },
  options:{
    message: "-m"
  }
})


//Add your actions

terminal.action("push", function(params){
  console.log(params) //{ remote: origin, branch: master } :) 
  //code to push
})


//Using ES6 destructuring

terminal.action("pull", function({ remote, branch }){
  console.log(remote, branch) //heroku, master
})


terminal.action("add",  function(params){
  console.log(params) // { repoLocation: "." }
})


terminal.action("commit", function(params){
  console.log(params) // { options: { message: "first commit" }}
})


// Listen for arguments

terminal.parse(process.argv)

```

## Help

Use --help, -h or help to view the help screen, for your root command or sub commands

## Commands

Add your commands to the terminaljs using the commands property

```
terminal.use({
  commands: {
    //Commands go here
  }
})

```

Each command has an array as its value, of all the arguments it is expecting and what it wants to call them.

Terminal js will out of the box validates the user cli inputs, an helpful error message will be printed out when a user puts in an invalid command, or they don't put the complete arguments needed for a specific command.

Terminaljs will process all the arguments and give you back an object with each of your argument names and the values supplied by the user. 

## Options

Options are command line key value pairs e.g --username "frank"
They could be long form (--username) or short form (-u)

You declare your options with an option object using terminaljs
The key for each object entry is the long form and the value is the short form

```
terminal.use({
  commands: {},
  options: {
    username: "-u",
    password: "-p"
  }
})
```

Users of your cli can use either the long form or the short form.

Terminal js will process all the options and append to the params object an option object property with all the supplied options and their values.

```
//Params Object
{
  ...commandArgs
  options: {
    username: "Frank"
  }
}
```

To make an option required for a specific command just add it to the array for that command
```
terminal.use({
  commands: {
    login: ["-u", "-p"],
  },
  options: {
    username: "-u",
    password: "-p"
   }
  })
```

Appropraite error will be sent for any input error

## Flags
Flags are true or false entities, they don't require an extra value just their presence is enough to change the behaviour

An example from npm (-i, --install) 

For flags add a flag object to the config. Same with options, the key is the long form and the value is the short form

```
terminal.use({
  commands: {},
  flags: {
    install: "-i"
  }
 })
 ```
 
 Terminaljs will add a flags property to the params telling you which flags have been activated
 ```
 //Params
 {
  ...commandArgs,
  flags: {
    install: true
  }
 }
 ```
 
 Flags can also be made required for a command by adding it to your command argument array
 
 
## Coming Up
An article will be realeased soon showing how to use terminaljs to build a full blown command line tool. Follow on twitter [@iammadab](https://twitter.com/iammadab) to get updated once it comes out. Happy Coding :)
