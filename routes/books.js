const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");

const uploadPath = path.join("public", Book.coversImageBasePath);
const imageMimeTypes = ["images.jpeg", "images.png", "images.gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
});

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
router.post("/", upload.single("cover"), (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImageName: req.file ? req.file.filename : null,
  });
  book
    .save()
    .then((newBook) => {
      // res.redirect(`books/${newBook.id}`)
      res.redirect("books");
    })
    .catch((err) => {
      if (book.coverImageName != null) {
        removeBookCover(book.coverImageName);
      }
      renderNewPage(res, book, true);
    });
});

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), (error) => {
    if (error) {
      console.error("error");
    }
  });
}

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

module.exports = router;
