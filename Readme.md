# Nota (TodoDoBackend) [![Build Status](https://travis-ci.org/jaylenw/nota.svg?branch=master)](https://travis-ci.org/jaylenw/nota) [![Coverage Status](https://coveralls.io/repos/github/jaylenw/nota/badge.svg?branch=master)](https://coveralls.io/github/jaylenw/nota?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/jaylenw/nota.svg)](https://greenkeeper.io/) [![GitHub Action](https://github.com/jaylenw/nota/workflows/ESLINT/badge.svg)](https://github.com/jaylenw/nota/actions)

![](https://github.com/jaylenw/nota/raw/master/screenshots/nota.png)

## Backend for AngularJSTodoApp, IonicTodoApp, & ElectronTodoApp

This reposistory contains the source code that makes up the backend
for [AngularJSTodoApp](https://github.com/jaylenw/AngularJsTodoApp), [IonicTodoApp](https://github.com/jaylenw/IonicTodoApp), and [ElectronTodoApp](https://github.com/jaylenw/ElectronTodoApp).

## Description

Users are able to use this App as a Todo-List or a Note Taking application.

## Features

* User Login, Logout, Registration, Reset Password
* Add, Edit, Update, Delete, and Archive Notes/Tasks
* Supports sending out emails with [Mailgun](https://www.mailgun.com/).

## Testing & Development

The best way to build, test, and run Nota is to use Docker. There are Dockerfiles
in this repository that will automatically install [MongoDB](https://www.mongodb.com/)
for local testing / development and Nota's dependencies.

1. The instructions below assume you have [Docker](https://www.docker.com/) and
[Docker Compose](https://docs.docker.com/compose/) installed.

2. Clone this repo.

3. In the root of the project folder, run `docker-compose build` to build a local
image of Nota.

### Docker In Interactive Mode

**Starting Interactive Mode**

Running the following command will drop you into a bash shell where you can run
various commands. The command will start MongoDB for you and make a volume mount
from your host machine to the Docker container so that any file changes on the
host will reflect in the container and vice versa.

`docker-compose run --user="$(id -u)" --service-ports -v $(pwd):/home/backenduser/app nota bash`

**Exiting from Interactive Mode**

Run `exit` while in interactive mode will bring you back to your host's shell.
By running `docker ps`, you will see that your containers are still running.
Run `docker-compose down` to stop all running containers.

### Running the tests

#### Testing w/ Docker Automatically

To run the tests for Nota, run the following command:

`sudo docker-compose up --exit-code-from nota`

The above command will start Nota and MongoDB and begin running the tests. The
command will then shutdown the containers that were spun up for testing.

**Note:** After the tests are completed, run the following to remove the database
related directory:

`sudo rm -rf database_vol_dir/`

See issue [#85](https://github.com/jaylenw/nota/issues/85). Please do the same
from the host machine when testing / developing manually with Docker.

#### Testing manually with Docker

You will need to start the containers in interactive mode.

1. Run `./scripts/test.sh` in the container to run the unit tests for Nota.

![](https://github.com/jaylenw/nota/raw/master/screenshots/tests.gif)

2. After running the tests, you will see a coverage summary of the tests informing
you what tests passed or not. Example in image below.

![](https://github.com/jaylenw/nota/raw/master/screenshots/coverage-summary.png)

3. You may also open `coverage/nota/index.html` file to see a break down of coverage
for every file in a report. Example in image below.

![](https://github.com/jaylenw/nota/raw/master/screenshots/coverage-report.png)

4. Running the unit tests and having everything passing is an excellent indicator
that your setup has all the dependencies installed.

5. You may click on the coverage badge above in this README to see the difference
in coverage with changes that have made in already pushed branches.

6. Running the test script will create the database and drop it once tests are
complete.

7. The 422 Bad response error is not related to Nota. It's an error that occurs
when the tests are not ran on Travis-CI.

### Developing

You will need to start the containers in interactive mode.

1. Run `./scripts/development.sh` to start the server in development mode.

2. Running the server in development mode is useful for testing Nota manually.

3. If not already existing, this will create a development database for Nota.

4. You will see output to the console in this mode.

5. Kill the server by using CTRL-C.

6. If you want a clean run of the server again, be sure to drop the development
database manually.

7. In the `Postman` directory, you may use the files in there to import a working
collection and environment to test out the APIs of Nota. [Postman](https://www.getpostman.com/)
is a great API testing software for testing out this backend.

8. [Robomongo / Robo 3T](https://robomongo.org/) is an awesome way to manage your
MongoDB databases.

**Note:** If you would like to connect to MongoDB from your host, you should be
able to with `localhost:27017` while docker-compose is running the containers
in interactive mode. The same with Nota on `localhost:3000`.

## Production

The way Nota is currently configured, it is assumed that you have a separate MongoDB
instance running somewhere where Nota can access it. There is no Docker image /
configuration provided for running MongoDB in production with Docker. Please
view the `Dockerfile-mongodb` file to see how you may use the installation
commands for setting up your MongoDB instance in your preferred environment.

### (Option 1) - With Docker

*Recommended*

Please use the files `docker-compose-deploy-dev` and `docker-compose-deploy-prod`
as examples for you to deploy Nota in a production environment. In those files,
you will see that we pull either the development or production Docker images of
Nota. We set the environment variables needed and configured [Watchtower](https://github.com/containrrr/watchtower)
to update our running containers when it detects a new image is available for
the dev or prod environments. I suggest putting a proxy server in front of the
Docker setup, such as [NGINX](https://www.nginx.com/).

### (Option 2) - No Docker

This option assumes you would like to deploy Nota in an environment without Docker.
Please make sure you read through the Docker files in this repository to make sure
the environment you choose to install Nota has the correct dependencies and configuration.
Please note, you will have to install `forever` via `npm` globally. I won't be
officially supporting this deployment option.

1. Run `./scripts/production.sh` to start the server. The script calls `forever` to start and
monitor the server.

2. If you need to kill `forever` for any reasons, run `forever list`. You will then see a list of all `forever` processes. Kill the `forever` process you want
by identifying the `pid` and killing it by running `forever stop pidNUM` where pidNUM is the pid number is the process you would like to kill.

3. By default, the server will be listening on port 3000.

4. [Forever](https://www.npmjs.com/package/forever) makes sure a node application stays
running if something were to cause it to be killed.

5. If you want, when deploying to a server, use [NGINX](https://www.nginx.com/) as a proxy in front of Nota. There are many benefits of doing so.

### Setting up authentication with MongoDB

This is mandatory for a production environment. By default, code in Nota does
not expect authentication to be handled for test and development environments.
To use test and development environment with MongoDB authentication,
go to `scripts/test.sh` and `scripts/development.sh` and make modifications to the line
exporting the `DATABASEURI`.

Note: When dropping collections or databases with a new user attached to it, that
new user may not be able to drop the database. Consult MongoDB documentation for
more info. The below instructions assumes you are not using a managed MongoDB
service and you are installing and setting up MongoDB yourself in your preferred
environment.

**Note, in production, please use a unique username and strong password
for everything.**

1.) Enter the mongo shell by running `mongo`.

2.) Need to create a user that has elevated privileges.

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

3.) Run `db.adminCommand('getCmdLineOpts');` to find your config file path.

3.) Exit out of the mongo shell.

4.) Go to your `mongodb.conf` file and uncomment the line `#auth = true`. Save
the file.

5.) Run `sudo service mongodb restart`.

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
above, as well, export your `RESET_URI`.

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
