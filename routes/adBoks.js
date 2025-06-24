const {Router} = require('express');
const Books = require("../schemas/books");
const User = require("../schemas/user");
const requireAuth = require('../middleware/authMiddleware');
const BooksHandler = Router();


BooksHandler.get('/add-book', requireAuth, (req, res) => {
    if(!req.session.user){
        res.redirect('/login');
    }
    res.render('addBook');
})
BooksHandler.post('/add-book', requireAuth, async (req, res) => {
    //checked session
    if(!req.session.user){
        res.redirect('/login');
    }
    // extracted details from request
    const {title, genre, pages} = req.body;
    try{
        //made new Book object form mongoose schema
        const newData = new Books({
        title,
        genre,
        pages : parseInt(pages)
    });
    //saving the new book created or we could have saved normally also without creating newBook
    const newBook = await newData.save();
    res.redirect('/dashboard');
    }catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send("Failed to add book");
    }
})

BooksHandler.get('/delete-book/:id', requireAuth, async (req,res)=>{
    //checking session
    if(!req.session.user){
        res.redirect('/login');
    }
    let bookId = req.params.id;
    try {
        //just pushed the mongoose method there
        await Books.findByIdAndDelete(bookId);
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error deleting book:", err);
        res.status(500).send("Failed to delete book");
    }
})

module.exports = BooksHandler;

