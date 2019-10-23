//Imports and Setup
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

//Server Credentials
var user = '';
var password = '';
var host = 'localhost';
var port = '27017';
var database = '';
var connectionString = 'mongodb://' + user + ':' + password + '@' + host +
    ':' + port + '/' + database;

/* This is the route that takes the user to the page where all the blogs are
   displayed. I created a variable for it, so we can easily change it in the
   future.
*/
var route = "/blogs";
var route2 = "/jblogs"

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);


//Just added this to see if the server is working
app.get("/", function(req, res) {
    res.render("launcher");
});

/* Retrieves all the Michael blogs from the database, then sends that blogs object to
   testV2.ejs, as blogsVar. So now blogsVar can be used in the ejs file.
*/
app.get(route, function(req, res) {
        blog.find({author: "Michael"}, function(err, blogs) {
        console.log("Sending Blogs: " + blogs);
        if (err) {
            console.log(err);
        } else {
            res.render("mikesHomePage", { blogsVar: blogs });
        }
    });
});

/* Retrieves all the Judy blogs from the database, then sends that blogs object to
   testV2.ejs, as blogsVar. So now blogsVar can be used in the ejs file.
*/
app.get(route2, function(req, res) {
    blog.find({author: "Judi"}, function(err, blogs) {
      console.log("Sending Blogs: " + blogs);
        if (err) {
            console.log(err);
        } else {
            res.render("judisHomePage", { blogsVar: blogs });
        }
    });
});

/* This is just a page that I created that contains a form, to test if I could
   add stuff to the server.
*/
app.get("/quickWriter", function(req, res) {
    res.render("quickWriter");
});

/* This is the post request that's used in the form. Gets the date, title, and
   body, then combines those in the form of a JSON object in the var newBlog.
   If the blog is successfuly created, it redirects them to the page that
   contains all the blogs.
*/
app.post("/create/new", function(req, res) {
    var author = req.body.author;
    var title = req.body.title;
    var body = req.body.body;
    var time = req.body.time
    var newBlog = { author: author, title: title, body: body, time: time};
    console.log("\nPosting blog: " + title);
    blog.create(newBlog, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
        console.log("Post success");
        }
    })
});

//Database Setup

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

/* A blog schema, for now I just included date, title, and body just for
   testing. Will probably experiment with images before I add them here.
*/
var blogSchema = new mongoose.Schema({
    author: String,
    title: String,
    body: String,
    time: String
});

/* This creates a collection if it doesn't exist and pluralizes the name. So
   in the server, there's a collection called "blogs" now. We'll probably need
   one of these for each user, so they have seperate collections.
*/
var blog = mongoose.model("prototypeTest1.1", blogSchema);



app.listen(3000, function() {
    console.log("Listening on port 3000");
});
