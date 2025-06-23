const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const BookSchema = new mongoose.Schema({
  bookID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Books',
    required: [true, "Book ID is required"]
  },
  pages: {
    type: Number,
    required: [true, "Pages are required"]
  },
  review: {
    type: String
  }
});

const user = new mongoose.Schema({
  email: {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  validate: [isEmail, 'Please enter a valid email address']
},
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  books: {
    type: [BookSchema],
    default: []
  }
});

// Pre-save hook to hash the password before saving
user.pre("save", async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})


user.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user){
    const auth = await bcrypt.compare(password, user.password);
    if(auth){
      return user;
    }throw Error("Incorrect Password")
  }
  throw Error("Incorrect Email");
}

module.exports = mongoose.model("User", user);
