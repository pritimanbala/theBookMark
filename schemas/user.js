const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const BookSchema = new mongoose.Schema({
  bookID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Books',
    required: [true, "Book ID is required"] //if true then goes with it but if not then returns the error of bookId is required 
  },
  pages: {
    type: Number,
    required: [true, "Pages are required"]
  },
  review: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
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
    default: [] // if booksSchema is not present then it will give you an empty string
  }
});


user.pre("save", async function(next) {
  // this if is used so that in login or save it doesnt hashes the password again and is isModified is used for that
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

//we made a static function and then we can use it like res.login('')

user.statics.login = async function (email, password) {
  // checking through email
  const user = await this.findOne({ email });
  if (user){
    //comparing hashed password and given password
    const auth = await bcrypt.compare(password, user.password);
    if(auth){
      return user;
    }throw Error("Incorrect Password")
  }
  throw Error("Incorrect Email");
}

module.exports = mongoose.model("User", user);
