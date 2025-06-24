const { generateKey } = require('crypto');
const mongoose = require('mongoose');
//just normal but important schema
const Books = new mongoose.Schema({
  title: {
    type: String,
    required: true //you can put conditions over here as done in the next users
  },
  genre: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true
  }
});


module.exports = mongoose.model('Books', Books);

