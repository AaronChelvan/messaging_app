# messaging_app

## Local Setup Instructions
* Install `Node.js` (https://nodejs.org/en/download/) and `MongoDB` (https://docs.mongodb.com/manual/installation/) on your system
* Clone this repository, navigate to it, and run `npm install` to install the dependencies
* Set the `EXPRESS_SECRET` environment variable to a random session secret
* Create a local MongoDB database
* Set the `DB_URL` environment variable to the URL of your database, e.g. `mongodb://localhost/your_db_name`
* Run `node app.js`
* The app will be running at http://localhost:8000
