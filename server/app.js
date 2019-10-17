//Imports and Setup
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

//Server Credentials
var user = '';
var password = '';
var host = '';
var port = '';
var database = '';
var connectionString = 'mongodb://' + user + ':' + password + '@' + host +
    ':' + port + '/' + database;

/* This is the route that takes the user to the page where all the blogs are
   displayed. I created a variable for it, so we can easily change it in the 
   future.
*/
var route = "/blogs";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 
app.engine('html', require('ejs').renderFile);


//Just added this to see if the server is working
app.get("/", function(req, res) {
    res.render("mikeLanding.html");
});

/* Retrieves all the blogs from the database, then sends that blogs object to
   testV2.ejs, as blogsVar. So now blogsVar can be used in the ejs file.
*/
app.get(route, function(req, res) {
    blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("mikesHomePage", { blogsVar: blogs });
        }
    });
});

/* This is just a page that I created that contains a form, to test if I could
   add stuff to the server.
*/
app.get("/create", function(req, res) {
    res.render("createblog");
});

/* This is the post request that's used in the form. Gets the date, title, and
   body, then combines those in the form of a JSON object in the var newBlog.
   If the blog is successfuly created, it redirects them to the page that 
   contains all the blogs.
*/
app.post("/create/new", function(req, res) {
    var date = req.body.date;
    var title = req.body.title;
    var body = req.body.body;
    var newBlog = { date: date, title: title, body: body };
    blog.create(newBlog, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(route);
        }
    })
});

//Database Setup

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

/* A blog schema, for now I just included date, title, and body just for
   testing. Will probably experiment with images before I add them here. 
*/
var blogSchema = new mongoose.Schema({
    date: String,
    title: String,
    body: String
});

/* This creates a collection if it doesn't exist and pluralizes the name. So
   in the server, there's a collection called "blogs" now. We'll probably need
   one of these for each user, so they have seperate collections.
*/
var blog = mongoose.model("blog", blogSchema);



app.listen(3000, function() {
    console.log("Listening on port 3000");
});