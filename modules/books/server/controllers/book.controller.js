const { request } = require('express');
const mongoose= require('mongoose');
const books= mongoose.model('Book');


  // Save book in the database
  async function create(req,res) {
    try {
        const book= new books();
        book.name= req.body.name;
        book.author=req.body.author;
        book.year=req.body.year;
        const result=await book.save();
        res.send(result);
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}

// Retrieve one books from the database.
async function read(req, res) {
  try {
      const name = req.query.name;
      var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
      const result= await books.find(condition);
      res.send(result);
  } catch (e) {
      throw new errors.InvalidData(e);
  }
}

// Update one books from the database.

async function update(req, res) {
  try {
    const id = req.params.id;
    books.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    await res.send({ message: "book was updated successfully." });
  } catch (e) {
      throw new errors.InvalidData(e);
  }
}

// Delete all books from the database.
async function remove(req, res) {
  try {
      books.deleteMany({})
      await res.send(`Books were deleted successfully!`);
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

