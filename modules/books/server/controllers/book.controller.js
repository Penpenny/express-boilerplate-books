const db = require("./modules/books/models");
const bookdb = db.books;
const Key = mongoose.model('Key');

  // Save book in the database
  async function create(book) {
    try {
        const key = new Key();
        key.key = chance.guid();
        key.book = book;
        const result = await key.save(book);
        return result.key;
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}


// Retrieve one books from the database.
async function read(book) {
  try {
      const result = await Key.findOne({ book });
      if (!result) throw new errors.InvalidData();
      return result.key;
  } catch (e) {
      throw new errors.InvalidData(e);
  }
}
// Update one books from the database.
async function update(book) {
  try {
      const result = await Key.findOneAndUpdate({ book }, { $set: { key: chance.guid() } }, { new: true });
      return result.key;
  } catch (e) {
      throw new errors.InvalidData(e);
  }
}

// Delete all books from the database.
async function remove(book) {
  try {
      const result = await Key.findOneAndRemove({ book });
      return result.key;
  } catch (e) {
      throw new errors.InvalidData(e);
  }
}

module.exports = {
  create,
  read,
  update,
  remove,
};
