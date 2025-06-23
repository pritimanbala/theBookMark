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

app.use( DashboardController);

app.get("/books/:id", requireAuth, async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            return res.redirect("/login"); 
        }

        const updatedUser = await User.findById(req.session.user._id);
        const bookId = req.params.id;
        const bookDetails = await Books.findById(bookId);

        if (!bookDetails) {
            return res.status(404).send("Book not found");
        }

        req.session.regenerate((err) => {
            if (err) {
                console.error("Error regenerating session:", err);
                return res.status(500).send("Session Error");
            }

            req.session.user = updatedUser.toObject();

            res.render("booksDetails", {
                book: bookDetails,
                title: "Book Details",
                user: req.session.user
            });
        });

    } catch (err) {
        console.error("Error in /books/:id route:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.use(UserRev);

app.get('/add-book', requireAuth, (req, res) => {
    res.render('addBook', { user: req.session.user });
});

app.post('/add-book', requireAuth, async (req, res) => {
    const { title, genre, pages } = req.body;

    try {
        const newBook = new Books({
            title,
            genre,
            pages: parseInt(pages)
        });
        await newBook.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send("Failed to add book");
    }
});
app.get("/delete-book/:id", requireAuth, async (req, res) => {
    const bookId = req.params.id;
    try {
        await Books.findByIdAndDelete(bookId);
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send("Error deleting book");
    }
});