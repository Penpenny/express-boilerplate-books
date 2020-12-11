const { books } = require("../controllers/book.controller.js");
module.exports = function(app) {
    // User Routes
    const users = require('../controllers');

    // Setting up the books api
    app.route('/create', controller.create);
    app.route('/read', controller.read);
    app.route('/update', controller.update);
    app.route('/remove/:user', controller.remove);
};
