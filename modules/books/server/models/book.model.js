var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BookSchema = new Schema({
  title: {
     type:String,
  },author:{
     type:String,
  },year:{
     type:Number,
  },
});
module.exports = mongoose.model('Book', BookSchema);