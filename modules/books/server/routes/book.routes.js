const books  = require("../controllers/book.controller.js");
module.exports = function(app) {

    // Setting up the books api
    app.route('/create', controller.create);
    app.route('/read', controller.read);
    app.route('/update', controller.update);
    app.route('/remove/:book', controller.remove);
};
