const express = require("express");
const path = require("path");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

//All books route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex('title', new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }

  try {
    const books = await query;
    res.render("books/index", { books, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

//new book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//create books route
router.post("/", (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);
  book
    .save()
    .then((newBook) => {
      // res.redirect(`books/${newBook.id}`)
      res.redirect("books");
    })
    .catch((err) => {
      renderNewPage(res, book, true)
    });
});

router.get('/:id', (req,res) => {
  res.send(`View book ${req.params.id}`)
})

router.get('/:id/edit', (req,res) => {
  res.send(`Edit book ${req.params.id}`)
})

router.put('/:id/', (req,res) => {
  res.send(`Update book ${req.params.id}`)
})

router.delete('/:id/', (req,res) => {
  res.send(`Delete book ${req.params.id}`)
})

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { book, authors };
    if (hasError) {
      params.errorMessage = "Error in creating book";
    }
    res.render("books/new", params);
  } catch {
    res.redirect("books");
  }
}

function saveCover(book, coverEncoded){
  if(coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if(cover !=null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type
  }
}

module.exports = router;
