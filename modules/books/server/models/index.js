const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(config.db.uri, options);
const db = {};
db.mongoose = mongoose;
db.books = require("./book.model.js")(mongoose);

module.exports = db;