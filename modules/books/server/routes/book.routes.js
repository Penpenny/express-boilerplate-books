module.exports = function(app) {
    // books Routes
    const books = require("../controllers/book.controller.js");
    // Create a new book
    app.route('/').post(books.create);
    // Retrieve all books
    app.route('/').get(books.findAll);
    // Update a book with id
    app.route('/:id').put(books.update);
    //delete book
    app.route('/').delete(books.deleteAll);
    app.use("/api/books", route);
};