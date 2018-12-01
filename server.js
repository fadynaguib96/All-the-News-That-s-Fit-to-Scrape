var express = require("express");

var mongoose = require("mongoose");

var axios = require("axios");

var cheerio = require("cheerio");

var exphbs = require("express-handlebars");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapperdb", { useNewUrlParser: true });

// Routes

// Route for getting all Articles from the db
app.get("/", function(req, res) {

      res.render("frontPage");
    })
   
  



// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {

    var result = {}

    axios.get("https://www.usatoday.com/sports/soccer/").then(function (response) {

    var $ = cheerio.load(response.data);

    $("a.hgpm-link").each(function (i, element) {

        var link = "https://www.usatoday.com" + $(element).attr("href")
        

        // console.log(link)

    

        axios.get(link).then(function (response) {
            
            var $ = cheerio.load(response.data);
            
            var title = $("h1.asset-headline").text()

            var summary = $("p.speakable-p-1").text()

            result.title = title
            result.link = link
            result.summary = summary
    
          db.Article.create(result)
        .then(function(dbArticle) {

          res.redirect("/")

        })
    
        })



        

    })

 

})

})
        
     


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for getting all Articles from the db
app.get("/commentForm/:id", function(req, res) {

  var articleID = req.params.id

  db.Article.findOne({ _id: req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comment")
  .then(function(dbArticle) {
    // If we were able to successfully find an Article with the given id, send it back to the client
    res.render("commentForm", dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });

})

  



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {comment : dbComment._id}} , { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.redirect("/articles")
    })
   
});

// Route for saving/updating an Article's associated Note
app.delete("/comment/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Comment.remove({_id: req.params.id})
  
    .then(function(dbComment) {
      // If we were able to successfully update an Article, send it back to the client
      res.redirect
    })
   
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
