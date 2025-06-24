const { Router } = require('express');
const User = require("../schemas/user");
const Books = require('../schemas/books');
const books = require('../schemas/books');
const UserRev = Router();

UserRev.post('/user-review-a/:id', async (req, res) => {
  const bookId = req.params.id;
  const { currentPage, review } = req.body;
  console.log("user-review route accessed");
  try {
    //check user session
    if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    //taking book and user detais
    const user = await User.findById(userId);
    const book = await Books.findById(bookId);
    let status = ""
    //checking the page doesn't exceeds
    if(book.pages < currentPage){
      return res.status(400).send('Pages Exceeded than the book')
    }else if (book.pages ===  currentPage){
      status = "completed";
    }else if (book.pages > currentPage){
      status = 'reading';
    }else{
      status = 'not-reading';
    }
    //final push of details of data
    user.books.push({
      bookID: bookId,
      pages: parseInt(currentPage),
      review: review,
      status: status
    });
    await user.save();
    //redirection of the page
    res.redirect("/books/" + bookId);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Internal Server Error");
  }
});
UserRev.post('/user-review-e/:id', async (req, res) => {
    const bookId = req.params.id;
    const { currentPage, review } = req.body;

    console.log("User update route accessed");

    try {
        //checked session
        if (!req.session.user) {
            console.log("User not logged in");
            return res.redirect("/login");
        }

        const userId = req.session.user._id;
        //find books and users and check status too
        const user = await User.findById(userId);
        const book = await Books.findById(bookId);
        let status = ''
        if(book.pages < currentPage){
          return res.status(400).send('Pages Exceeded than the book')
        }else if (book.pages === parseInt(currentPage)){
          status = "completed";
        }else if (book.pages > currentPage){
          status = 'reading';
        }else{
          status = 'not-reading';
        }

        if (!user) {
            return res.status(404).send("User not found");
        }
        //checking if the book exists or not in the user books list
        const bookEntry = user.books.find(b => b.bookID.toString() === bookId);
        //if no book
        if (!bookEntry) {
            return res.status(404).send("Book entry not found in user data");
        }
        //made the object bookEntry
        bookEntry.pages = parseInt(currentPage);
        bookEntry.review = review;
        bookEntry.status = status;
        //pushed
        await user.save();

        res.redirect("/books/" + bookId);
    } catch (err) {
        console.error("Error updating book review:", err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = UserRev;
