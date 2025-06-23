const { generateKey } = require('crypto');
const mongoose = require('mongoose');

const Books = new mongoose.Schema({
  title: {
    type: String,
    required: true
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

