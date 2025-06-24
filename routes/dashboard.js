const { Router } = require('express');
const Books = require("../schemas/books");
const requireAuth = require('../middleware/authMiddleware');
const DashboardController = Router();

DashboardController.get('/dashboard',requireAuth, async (req, res) => {
  console.log("Dashboard route accessed");
  try {
    if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }

    const books = await Books.find().sort({ createdAt: -1 });
    console.log("User session:", req.session.user);
    res.render("dashboard", {
      title: "Dashboard",
      user: req.session.user,
      books: books
    });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Internal Server Error");
  }
});


DashboardController.get('/completed', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const books = await Books.find().sort({createdAt: -1});
    console.log("these books were logged", user.books);
    const compBooks = user.books.filter(book => book.status === 'not-reading');
    const bookIds = compBooks.map(entry => entry.bookID);

    const completedBooks = await Books.find({_id: {$in : bookIds}}).sort({createdAt: -1});
    res.render("dashboard", {
      title: "completed Books",
      user: req.session.user,
      books: completedBooks
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Internal Server Error");
  }
})

DashboardController.get('/reading', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const books = await Books.find().sort({createdAt: -1});
    console.log("these books were logged", user.books);
    const compBooks = user.books.filter(book => book.status === 'reading');
    const bookIds = compBooks.map(entry => entry.bookID);

    const completedBooks = await Books.find({_id: {$in : bookIds}}).sort({createdAt: -1});
    res.render("dashboard", {
      title: "Reading Books",
      user: req.session.user,
      books: completedBooks
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    
    res.status(500).send("Internal Server Error");
  }
})
module.exports = DashboardController;
