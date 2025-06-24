const { Router } = require('express');
const Books = require("../schemas/books");
const requireAuth = require('../middleware/authMiddleware');
const DashboardController = Router();

DashboardController.get('/dashboard',requireAuth, async (req, res) => {
  //just checking the user passes through this route or not
  console.log("Dashboard route accessed");
  try {
    //checking session or you could have made a function to check the things everywhere
    if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }
    //i dont think you can directly get all the data with out the sort function but yeah we are extracting those from the database
    const books = await Books.find().sort({ createdAt: -1 });
    console.log("User session:", req.session.user); //consoling the user session
    // passing the 3 values as title, user for its name and other details needed and books for printing or showing
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
    //checking session
    if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }
    const user = req.session.user;
    const books = await Books.find().sort({createdAt: -1});
    console.log("these books were logged", user.books);
    //just checking the books what user has read or is reading
    const compBooks = user.books.filter(book => book.status === 'completed'); //compBooks has all the objects having completed status i dont know why is this bug here
    const bookIds = compBooks.map(entry => entry.bookID);// bookIds maps out all the bookID present in the users session and makes a list out of it
    // rendering the data from database
    //$in allows you to send multiple find request and then get multiple data out of it
    const completedBooks = await Books.find({_id: {$in : bookIds}}).sort({createdAt: -1});
    //pushing the data into dashboard
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
  //exactly same as done in completed
  if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }
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
