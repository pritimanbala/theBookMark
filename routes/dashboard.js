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
    console.log(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = DashboardController;
