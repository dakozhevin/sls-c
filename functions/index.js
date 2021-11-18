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

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sls-c-171ec-default-rtdb.europe-west1.firebasedatabase.app"
});

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

app.get('/app', async (request, response) => {
  var db_result = await getFirestore();
  // response.render('index', { db_result });
  response.status(200).send(`<!doctype html>
    <head>
      <title>App</title>
    </head>
  </html>`);
});
exports.app = functions.https.onRequest(app);

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

