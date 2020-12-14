const books  = require("../controllers/book.controller.js");
module.exports = function(app) {

    // Setting up the books api
    app.route('/create').post( books.create);
    app.route('/read').get(books.read);
    app.route('/update').put(books.update);
    app.route('/remove').delete( books.remove);
};
