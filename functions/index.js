const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const admin = require('firebase-admin');

const app = express();
app.engine('hbs',
  engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

admin.initializeApp(functions.config().firebase);
/*
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sls-c-171ec-default-rtdb.europe-west1.firebasedatabase.app"
});
*/

async function getFirestore() {
  const firestore_con = await admin.firestore();
  const writeResult = firestore_con.collection('sample').doc('sample_doc').get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      }
      else {
        return doc.data();
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  return writeResult
}

app.get('/', async (request, response) => {
  var db_result = await getFirestore();
  response.render('index', { db_result });
});
exports.app = functions.https.onRequest(app);

async function insertFormData(request) {
  const writeResult = await admin.firestore().collection('form_data').add({
    firstname: request.body.firstname,
    lastname: request.body.lastname
  })
    .then(function () {
      console.log("Document successfully written!");
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

app.post('/insert_data', async (request, response) => {
  var insert = await insertFormData(request);
  response.sendStatus(200);
})

exports.bigben = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1  // London is UTC + 1hr;
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${'BONG '.repeat(hours)}
    </body>
  </html>`);
});

