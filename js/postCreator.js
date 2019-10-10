//Gets posts from server and loads them onto page.

console.log("postCreator.js loaded sucessfully.");


//this was just testing for actual getPosts() in testServer.js
async function getPosts() {
  console.log("Getting posts.");
  let client, db, collection, result;
  let url = "mongodb://localhost:27017/";
  let MongoClient = require('./node_modules/mongodb').MongoClient;
  try {
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = client.db("testdb");
    collection = db.collection("posts");

    result = await collection.find({
      author: "Evan"
    }).toArray();

    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


//GET request to server to retrieve posts
function loadPostsOnPage() {
  //comment this out if running through browser
  // var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      createPosts(xhttp.responseText);
    }
  };

  xhttp.open("GET", "http://localhost:8080/getPosts", true);
  xhttp.send();
}

//Loop through all recieved posts
function createPosts(responseText) {
  responseTextJSON = JSON.parse(responseText);
  for (index in responseTextJSON){
    createPost(responseTextJSON[index]);
  }
  console.log("Sucessfully loaded posts!");
}

//Creates post element in <div id=posts>
function createPost(post) {
  let title = post.title;
  let body = post.body;

  //this is a really ugly way of doing this....look for something better later
  let newPost = `
    <section class="post">
      <header class="post-header">

        <h2 class="post-title">${title}</h2>

      </header>

      <div class="post-description">
        <p>
          ${body}
        </p>
      </div>
    </section>
    `;
  var posts = document.getElementById("posts");
  var post = document.createElement("post");
  post.innerHTML = newPost;
  posts.appendChild(post);
}
