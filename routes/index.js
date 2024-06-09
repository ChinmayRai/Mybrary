const express = require("express");
const router = express.Router();
const Book = require("../models/book");

router.get("/", (req, res) => {
  Book.find({})
    .sort({ createdAtDate: "desc" })
    .limit(10)
    .then((books) => res.render("index", { books }));
});

module.exports = router;
