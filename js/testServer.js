//A lot of this is copy pasted from the code that was being tested ib ugdev.cs.smu.ca


var express = require('express');
var mongodb = require('mongodb');


var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

var server = express();

server.use(allowCrossDomain);
server.use(express.json());
server.use(express.urlencoded({
  extended: false
}));
server.use(express.static(__dirname));

server.listen(8080);

console.log("Server running.\n")

//returns sorted array of posts
server.get('/getPosts', async function(req, res) {
  let temp = await getPosts();

  let logmsg="Sending out "+temp.length+ " posts\n";
  console.log(logmsg);
  //return array with most recent posts first
  temp.sort((a, b) => parseFloat(b.published) - parseFloat(a.published));
  res.send(temp);
})

//retrieves all posts with author "Evan" (placeholder, i didn't write all those i swear)
async function getPosts() {
  console.log("Getting posts.");
  let client, db, collection, result;
  let url = "mongodb://localhost:27017/";
  let authorplaceholder = "Evan"
  let MongoClient = require('mongodb').MongoClient;
  try {
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    db = client.db("testdb");
    collection = db.collection("posts");

    result = await collection.find({
      author: authorplaceholder
    }).toArray();
    return result;

  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}



//Super overkill to make sure the server shuts down if this is closed/crashes
process.once('SIGINT', function(code) {
  console.log('SIGINT received...');
  server.close();
});

process.once('SIGKILL', function(code) {
  console.log('SIGINT received...');
  server.close();
});


process.once('SIGTERM', function(code) {
  console.log('SIGTERM received...');
  server.close();
});

process.on('exit', function() {
  console.log('About to exit, waiting for remaining connections to complete');
  server.close();
});
