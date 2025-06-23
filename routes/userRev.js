const { Router } = require('express');
const User = require("../schemas/user");
const UserRev = Router();

UserRev.post('/user-review-a/:id', async (req, res) => {
  const bookId = req.params.id;
  const { currentPage, review } = req.body;
  console.log("user-review route accessed");

  try {
    if (!req.session.user) {
      console.log("User not logged in, redirecting to login page");
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    const user = await User.findById(userId);

    user.books.push({
      bookID: bookId,
      pages: parseInt(currentPage),
      review: review
    });

    await user.save();
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
        if (!req.session.user) {
            console.log("User not logged in");
            return res.redirect("/login");
        }

        const userId = req.session.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }
        const bookEntry = user.books.find(b => b.bookID.toString() === bookId);

        if (!bookEntry) {
            return res.status(404).send("Book entry not found in user data");
        }
        bookEntry.pages = parseInt(currentPage);
        bookEntry.review = review;

        await user.save();

        res.redirect("/books/" + bookId);
    } catch (err) {
        console.error("Error updating book review:", err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = UserRev;
