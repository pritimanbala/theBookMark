const express = require('express');
const mongoose = require('mongoose');
const fs = require("fs");
const UserAuth = require('./routes/UserAuth');
const DashboardController = require('./routes/dashboard');
const session = require('express-session');
const Books = require("./schemas/books");
const UserRev = require('./routes/userRev');
const User = require("./schemas/user")
const cookieParser = require('cookie-parser');
const requireAuth = require('./middleware/authMiddleware');
const BooksHandler = require('./routes/adBoks');
const BookUpd = require('./routes/booksFind');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(process.env.PORT);
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err); 
        console.log("Server not started due to MongoDB connection error");
    });


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));


app.use(UserAuth);
app.use(DashboardController);
app.use(BookUpd);
app.use(UserRev);
app.use(BooksHandler);