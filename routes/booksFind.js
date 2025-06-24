const {Router} = require('express');
const User = require('../schemas/user');
const Books = require('../schemas/books');
const requireAuth = require('../middleware/authMiddleware');

const BookUpd = Router();

BookUpd.get('/books/:id', requireAuth, async (req,res)=>{
    if(!req.session.user){
        res.redirect('/login');
    }
    try {
        //gets the new user
        const updatedUser = await User.findById(req.session.user._id);
        const bookId = req.params.id;
        //FINDS THE BOOK
        const findBook = await Books.findById(bookId);
        if(!findBook){
            return res.status(400).send('book not found');
        }

        //session regeerated
        req.session.regenerate((err) => {
            if(err){
                console.error("Error regenerating session:", err);
                return res.status(500).send("Session Error");
            }
            //updates to new session user
            req.session.user = updatedUser.toObject();
            //renders to that page back
            res.render("booksDetails", {
                book: findBook,
                title: "Book Details",
                user: req.session.user
            });
        })
    } catch (err) {
        console.error("Error in /books/:id route:", err);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = BookUpd;
