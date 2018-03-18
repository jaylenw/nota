# Nota (TodoDoBackend) [![Build Status](https://travis-ci.org/jaylenw/nota.svg?branch=master)](https://travis-ci.org/jaylenw/nota) [![Coverage Status](https://coveralls.io/repos/github/jaylenw/nota/badge.svg?branch=master)](https://coveralls.io/github/jaylenw/nota?branch=master)

[![Greenkeeper badge](https://badges.greenkeeper.io/jaylenw/nota.svg)](https://greenkeeper.io/)

## Backend for AngularJSTodoApp & IonicTodoApp

This reposistory contains the source code that makes up the Backend
for [AngularJSTodoApp](https://github.com/jaylenw/AngularJsTodoApp) and [IonicTodoApp](https://github.com/jaylenw/IonicTodoApp).

Installation instructions on this backend are found below and also on the
on the projects' repo linked above.

## Build, Testing, & Development

1. Need to have [Nodejs](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/), installed on your system globally. If running a Debian/Ubuntu system and you do not have the packages installed globally, run these commands below:

        sudo apt update  
        sudo curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -  
        sudo apt install nodejs  
        sudo ln -s /usr/bin/nodejs /usr/bin/node
        sudo npm install forever -g

2. Clone this repo.

3. In the root of the project folder, run `npm install`.

4. Next, install mongodb on your system globally and have it running. If on a Ubuntu/Debian system, you would run
   `sudo apt install mongodb`.

5. Use forever to start the server, run `forever start bin/www`.

6. If you need to kill `forever` for any reasons, run `forever list`. You will then see a list of all `forever` processes. Kill the `forever` process you want
by identifying the `pid` and killing it by running `forever stop pidNUM` where pidNUM is the pid number is the process you would like to kill.

7. By default, the server will be listening on port 3000.

8. This backend allows the user to register, login, logout, create tasks, retrieve tasks, edit tasks, and delete tasks.

# Routes

User Specific
--------------

using "POST" Method
`/users/login`
requires passing "email" and "password" fields in body

using"POST" Method
`/users/register`
requires passing "email" and "password" fields in body

Task Specific
-------------

using "GET" Method (Retrieves all Task for a user)
`/tasks`
requires passing in the user "token" as params

using "POST" Method (Creates a Task)
`/tasks`
requires passing in "title" and "body" fields in the body

using "PUT" Method (Updates a specific Task)
`/tasks/:id`
requires passing in "id" of a Task as an url paramater and token as query parameter

using "DELETE" Method (Deletes a specific Task)
`/tasks/:id`
requires passing in "id" of a Task as an url parameter and token as a query
parameter

[Postman](https://www.getpostman.com/) is a great API testing software for testing out this backend.

-------------------------------------------------------------------------------

Pull request and issues are welcomed.

--------------------------------------------------------------------------------

Special Thanks to [@julianpoy](https://github.com/julianpoy) for making the foundation of this express app. This code base was derived from [here](https://github.com/julianpoy/jaylenBackend).
