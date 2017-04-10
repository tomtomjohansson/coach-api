# API for mobile football-application
###### This is an api for a mobile football application. Work on project began in 2016 and is still in development.

## Technologies
This api is built with Express. It uses Mongoose as an ODM for MongoDB. Encryption and user authentication handled by Bcrypt, Passport and JsonWebToken. It uses express-validator to validate data sent from the app.

## Starting the app
In all cases you will need to have these things installed on your computer:
Node.js
NPM
MongoDB
Since this app uses MongoDB, you will need to know the basics of how to run that.

##### For viewing purposes only
1. Fork the repository
2. Navigate to the root directory of the project in your command-line.
3. Type in "npm install". This will install dependencies.
4. Type in "npm start". This will start the express-server.
5. The api uses port 3000.

Since this is a stand alone api without any static content I would suggest using Postman to test the api-endpoints. Before starting the api you will also need to creata a .env-file and set the environment-variable "SECRET" to your liking.

## Directory structure
```javascript
src/
----api/
--------games.js
--------players.js
--------stats.js
--------trainings.js
--------users.js
----database/
--------backupHandler.js
--------connection.js
--------removeUnusedDocs.js
----models/
--------assistants.js
--------login.js
----passport/
--------passport.js
----settings/
--------index.js
----validation/
--------defaultObjects.js
--------userValidation.js
server.js
```
##### Api directory
Contains the api-endpoints.

##### Database directory
* backupHandler.js sets up a schedule for backups of the database.
* connection.js connects to the database.
* removeUnusedDocs goes through the database searching for documents that are not being used. Sends warnings to users after 90 days of inactivity and deletes user two weeks later.

##### Models directory
Uses the ODM mongoose for creating object models for the database.

##### Passport directory
Used for password-validation.

##### Settings directory
General settings for the api, including database-settings.

##### Validation directory
Sets rules for how the data from the app gets validated.

##### Root directory
* server.js sets up and starts the api. Sets up routes and verifies jsonwebtokens.