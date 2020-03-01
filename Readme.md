# Nota (TodoDoBackend) [![Build Status](https://travis-ci.org/jaylenw/nota.svg?branch=master)](https://travis-ci.org/jaylenw/nota) [![Coverage Status](https://coveralls.io/repos/github/jaylenw/nota/badge.svg?branch=master)](https://coveralls.io/github/jaylenw/nota?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/jaylenw/nota.svg)](https://greenkeeper.io/) [![GitHub Action](https://github.com/jaylenw/nota/workflows/ESLINT/badge.svg)](https://github.com/jaylenw/nota/actions)

![](https://github.com/jaylenw/nota/raw/master/screenshots/nota.png)

## Backend for AngularJSTodoApp & IonicTodoApp

This reposistory contains the source code that makes up the Backend
for [AngularJSTodoApp](https://github.com/jaylenw/AngularJsTodoApp), [IonicTodoApp](https://github.com/jaylenw/IonicTodoApp), and [ElectronTodoApp](https://github.com/jaylenw/ElectronTodoApp).

Installation instructions on this backend are found below and also on the
on the projects' repo linked above.

## Build

*Pro-tip*: A `vagrantfile` for Nota exists [here](https://github.com/jaylenw/VagrantBoxes/tree/master/Nota) if you would like
to use it to quickly get your development environment setup.

1. This guide assumes you are running a 16.04 LTS 64 bit Ubuntu system. Need to have [Nodejs](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/), installed on your system globally. If you do not have the packages installed globally, run these commands below:

        sudo apt update
        sudo curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
        sudo apt install nodejs
        sudo ln -s /usr/bin/nodejs /usr/bin/node
        sudo npm install forever -g

2. Clone this repo.

3. In the root of the project folder, run `npm install`.

4. Next, install mongodb on your system globally and have it running. You would run
the commands below.

   ```
   sudo apt install mongodb -y
   sudo apt-get update
   sudo apt-get install mongodb -y
   ```

## Setting up authentication with MongoDB

Mandatory for Production Environment, optional for test and development.
By default, code in Nota does not expect authentication to be handled for test and development
environments. To use test and development environment with mongodb authentication,
go to `scripts/test.sh` and `scripts/development.sh` and make modifications to the line
exporting the `DATABASEURI`.

Note: When dropping collections or databases with a new user attached to it, that
new user may not be able to drop the database. Consult MongoDB documentation for
more info.

**Note, in production, please use a unique username and strong password
for everything.**

1.) Enter the mongo shell by running `mongo`

2.) Need to create a user that has elevated privileges

```
use admin
db.createUser(
  {
    user: "root",
    pwd: "<your-own-password>",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
```

3.) Run `db.adminCommand('getCmdLineOpts');` to find your config file path

3.) Exit out of the mongo shell

4.) Go to your `mongodb.conf` file and uncomment the line `#auth = true`. Save
the file.

5.) Run `sudo service mongodb restart`

6.) Login as admin and connect to authentication database.
`mongo -u "root" -p "<your-own-password>" --authenticationDatabase "admin"`

7.) Specify the database you would like to enable authentication for.
The username and password URI in `scripts/production.sh` can be used for reference
for the commands below.

 Run `use nota-test`, where nota-test is the database.

```
db.createUser(
  {
   user: "nota-test",
   pwd: "nota-test",
   roles: [ "readWrite"]
  })
```

## Testing

1. Run `./scripts/test.sh` to run the unit tests for Nota.

![](https://github.com/jaylenw/nota/raw/master/screenshots/tests.gif)

2. After running the tests, you will see a coverage summary of the tests informing
you what tests passed or not. Example in image below.

![](https://github.com/jaylenw/nota/raw/master/screenshots/coverage-summary.png)

3. You may also open `coverage/nota/index.html` file to see a break down of coverage
for every file in a report. Example in image below.

![](https://github.com/jaylenw/nota/raw/master/screenshots/coverage-report.png)

4. Running the unit tests and having everything passing is an excellent indicator
that your system has all the dependencies installed.

5. You may click on the coverage badge above in this README to see the difference
in coverage with changes that have made in already pushed branches.

6. Running the test script will create the database and drop it once tests are
complete.

7. The 422 Bad response error is not related to Nota. It's an error that occurs
when the tests are not ran on Travis-CI.

## Development

1. Run `./scripts/development.sh` to start the server in development mode.

2. Running the server in development mode is useful for testing Nota manually.

3. If not already existing, this will create a development database for Nota.

4. You will see output to the console in this mode.

5. Kill the server by using CTRL-C.

6. If you want a clean run of the server again, be sure to drop the development
database manually.

7. In the `Postman` directory, you may use the files in there to import a working
collection and environment to test out the APIs of Nota. [Postman](https://www.getpostman.com/) is a great API testing software for testing out this backend.

8. [Robomongo / Robo 3T](https://robomongo.org/) is an awesome way to manage your
MongoDB databases.

## Production

1. Run `./scripts/production.sh` to start the server. The script calls `forever` to start and
monitor the server.

2. If you need to kill `forever` for any reasons, run `forever list`. You will then see a list of all `forever` processes. Kill the `forever` process you want
by identifying the `pid` and killing it by running `forever stop pidNUM` where pidNUM is the pid number is the process you would like to kill.

3. By default, the server will be listening on port 3000.

4. [Forever](https://www.npmjs.com/package/forever) makes sure a node application stays
running if something were to cause it to be killed.

5. If you want, when deploying to a server, use [Nginx](https://www.nginx.com/) as a proxy in front of Nota. There are many benefits of doing so.

### Note

If you ever encounter MongoDB being locked and is returning no response to Nota,
run these commands below.
```
sudo rm /var/lib/mongodb/mongod.lock
mongod --repair
sudo service mongodb start
```

## Emails w/ Mailgun

By default, emails are deactivated in Nota. Unit tests will run fine without sending
emails unless you activate Nota to send emails. To activate emails, you must do the
following below for testing:

```bash
export ACTIVATE_EMAIL=true
export MAILGUN_API_KEY=<"your mailgun api key value">
export MAILGUN_DOMAIN=<"your mailgun domain value">
export TEST_EMAIL=<"your verified test email">
```

Running tests after activating emails and providing the correct test email,
emails will be sent to your inbox if you have configured everything correctly
with Mailgun.

When you have set Nota up for production, provide the necessary information as
above, as well, export your reset uri.

```bash
export RESET_URI=<"your determined reset uri">
```

If you would like to change the subject or content of the emails being sent, you
may do so in `config/default.js`.

I recommend testing sending emails to yourself in Mailgun's sandbox mode before
implementing emails for production. You may find more information about [Mailgun](https://www.mailgun.com/)
on it's site.

## Routes

This backend allows the user to register, login, logout, reset password, create tasks, retrieve tasks, edit tasks, and delete tasks.

![](https://github.com/jaylenw/nota/raw/master/screenshots/current-routes.png)


## Using Docker for Running Tests (WIP)

**1.)** Build the Ubuntu base image by running the following:

`docker build -f Dockerfile-base . -t "ubuntu16.04-updated" --no-cache`

**2.)** Build the nota and database containers with docker-compose:

`docker-compose build`

**3.)** Run the following docker compose command to run the tests:

`docker-compose up`

**4.)** After the tests are completed, run the following to remove the database related directory:

`sudo rm -rf database_vol_dir/`

See issue [#85](https://github.com/jaylenw/nota/issues/85).

-------------------------------------------------------------------------------
# Contributing

Pull request and issues are welcomed. Please make sure you are able to run the
unit tests with all passing before raising a PR. Add or modify unit tests sensibly
if needed. As well, be descriptive in your PR description and tag any relevant issues.
Before making changes for a pull request, create or note an issue first, and use the
issue number to create a new branch with the issue number in the branch name
(ex. ghi-{issuenumber}, ghi-22} to include your work in. Thank you! :)

--------------------------------------------------------------------------------

Special Thanks to [@julianpoy](https://github.com/julianpoy) for making the foundation of this express app. This code base was derived from [here](https://github.com/julianpoy/jaylenBackend). Special Thanks to [@cheriejw](https://github.com/cheriejw) for providing Nota's logo.

Made with ♥ in Los Angeles & Long Beach CA.
