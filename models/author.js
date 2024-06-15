const mongoose = require("mongoose");
const Book = require("./book");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre("deleteOne", { document: true },function (next) {
  Book.find({ author: this.id })
    .then((books) => {
      next(books.length > 0 ? new Error("This author still has books") : "");
    })
    .catch((err) => next(err));
});

module.exports = mongoose.model("Author", authorSchema);
