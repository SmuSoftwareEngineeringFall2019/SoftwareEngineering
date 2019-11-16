//========
//Initial Setup
//========

//Imports and Setup
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

//Configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);

//Server Credentials
var user = '';
var password = '';
var host = 'localhost';
var port = '27017';
var database = '';
var connectionString = 'mongodb://' + user + ':' + password + '@' + host +
    ':' + port + '/' + database;

//========
//Database Setup
//========

mongoose.connect(connectionString, { useNewUrlParser: true, 
    useUnifiedTopology: true });

/* A blog schema with two main variables: title and body. Created just 
    specifies the date the blog was created. Published is not implemented at
    the moment, but it will allow the user to choose if they want their blog
    to be seen by others. The author is an object that refers to a 
    corresponding user, in order to show who owns the blog.
*/
var blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    created: { type: Date, default: Date.now },
    published: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        page: String
    }
});

/* A user schema with a username and password as the basic variables. I added
   a page field for a user with the default value as "mikesHomePage", but this
   is just a temporary value for now. This will allow us to specify custom or
   generic pages for new users.
*/
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    page: { type: String, default: 'mikesHomePage'}  //Change to correct page//
});

/* Plugin to use the passportlocalmongoose package with a setting to make all 
   usernames lowercase, in order to not have any conflicts.
*/
userSchema.plugin(passportLocalMongoose, {usernameLowerCase: true});

/* This creates a collection if it doesn't exist and pluralizes the name. So
   in the server, there's a collection called "blogs" now. We'll probably need
   one of these for each user, so they have seperate collections.
*/
var blog = mongoose.model("blog", blogSchema);
var User = mongoose.model("User", userSchema);

/* Passport package config. The secret field is any sentence, so I just chose 
   a random one. Also saves the user's login indefinitely, unless they logout,
   or clear their cookies.
*/
app.use(session({
    secret: "I attend Saint Mary's University",
    store: new mongoStore({mongooseConnection: mongoose.connection}),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Passing currentUser to every route. This will be used to display a login and
   register button if a user is not logged in, as well as display a logout 
   button if a user is logged in. Can also display a "welcome <user>" messsage.
   This is for future use in the next version.
*/
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

//========
//Blog Routes
//========

//Home page route
app.get("/", function(req, res) {
    res.render("mikeLanding.html");
});

/* If a user is logged in, this path will take them to their blogs page. If
   someone isn't logged in, then it will redirect them to the login page.
*/
app.get("/blogs", function(req, res) {
    if(req.isAuthenticated()) {
        res.redirect("/blogs/" + req.user.username);
    }
    else {
        res.redirect("/login");
    }
})

/* Route that redirects the user to their writer. Uses the isLoggedIn 
   middleware function to make sure a user is authorized to access the writer.
*/
app.get("/blogs/new", isLoggedIn, function(req, res) {
    res.render("createblog");
});

/* This route is our main route. The ":/user" is the username someone types into
   their browser url after "blogs/". There is a middleware function to make
   sure the user exists. Mongoose finds all blogs with the given username first.
   If a user has no blogs, then only the user who owns the blog can see it.
   The page displays normally to others if the user has at least one blog.
*/
app.get("/blogs/:user", userExists, function(req, res) {
    var userName = req.params.user;
    blog.find({"author.username": userName}, function(err, blogs) { 
        if (err) {
            console.log(err);
        } else if(req.isAuthenticated()) {
            res.render(req.user.page, { blogsVar: blogs });
        } else if (blogs.length != 0){
            res.render(blogs[0].author.page, { blogsVar: blogs });
        } else {
            res.redirect("/");
        }
    });
});

/* Post route to create a new blog. Uses the isLoggedIn middleware function,
   to make sure only a logged in user can create a blog. The author variable
   is an object that contains the logged in users information. After a user
   successfully creates a blog they will be redirected to their blogs page.
*/
app.post("/blogs", isLoggedIn, function(req, res) {
    var title = req.body.title;
    var body = req.body.body;
    var author = {
        id: req.user._id,
        username: req.user.username,
        page: req.user.page
    };
    var newBlog = {title: title, body: body, author: author};
    blog.create(newBlog, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/blogs/" + author.username );
        }
    });
});

//========
//Authorization Routes
//========

//Shows the register form
app.get("/register", function(req, res) {
    res.render("register");
});

/* Uses the passport package to help with registration. It takes care of 
   salting and hashing the password, so that we never store the actual password
   in the database. After a user registers, it authenticates them, then redirects
   them to their new blogs page.
*/
app.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/blogs/" + req.user.username);
        });
    });
});

//Shows the login form
app.get("/login", function(req, res) {
    res.render("login");
});

/* Handles the login of users. Currently it does not alert a user if something
   went wrong, such as an incorrect password, instead it just redirects them
   back to the login page. I plan on adding flash error messages in the next
   version.
*/
app.post("/login", passport.authenticate("local",
    {
        failureRedirect: "/login"}),
        function(req, res) {
            res.redirect("/blogs/" + req.user.username);
        });
        

//Logout route. 
app.get("/logout", function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
});

//========
//Middleware functions
//========

//Function that checks if a user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Function that checks if a user exists
function userExists(req, res, next) {
    var userName = req.params.user;
    User.findOne({username: userName}, function(err, result) {
        console.log(result);
        if(err){ 
            console.log(err);
        } else if(!result) {
            res.redirect("/");
        } else {
            next();
        }

    });
}

app.listen(3000, function() {
    console.log("Listening on port 3000");
});
