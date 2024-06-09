const express = require("express");
const router = express.Router();
const Author = require("../models/author");

//All authors route
router.get("/", (req, res) => {
  const searchOptions = {};
  if (req.query.name != null && req.query.name != " ") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  Author.find(searchOptions)
    .then((authors) =>
      res.render("authors/index", { authors, searchOptions: req.query })
    )
    .catch(() => res.redirect("/"));
});

//new authors route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

//create authors route
router.post("/", (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  author
    .save()
    .then((newAuthor) => {
      // res.redirect(`authors/${newAuthor.id}`)
      res.redirect("authors");
    })
    .catch((err) =>
      res.render("authors/new", { author, errorMessage: "Error in creation" })
    );
});

module.exports = router;
