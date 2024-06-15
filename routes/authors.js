const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

//All authors route
router.get("/", (req, res) => {
  const searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
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
      res.redirect(`authors/${newAuthor.id}`);
    })
    .catch((err) =>
      res.render("authors/new", { author, errorMessage: "Error in creation" })
    );
});

router.get("/:id", async (req, res) => {
  try{
    const author = await Author.findById(req.params.id);
    const bookByAuthor = await Book.find({author : author.id }).limit(6)
    res.render("authors/show", { author,  bookByAuthor})
  }catch{
    res.redirect("/");
  }
});

router.get("/:id/edit", (req, res) => {
  Author.findById(req.params.id)
    .then((author) => res.render("authors/edit", { author }))
    .catch(() => res.render("authors"));
});

router.put("/:id/", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit/", {
        author,
        errorMessage: "Error in updating author",
      });
    }
  }
});

router.delete("/:id/", async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id);
    await author.deleteOne();
    res.redirect("/authors");
  } catch{
    res.redirect(`/authors/${req.params.id}`);
  }
});

module.exports = router;
