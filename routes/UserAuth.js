const { Router } = require('express');
const UserAut = require("../controllers/authControler")
const UserAuth = Router();

//made all the routes available from here and made a controller function there to access all the functions from there
UserAuth.get('/login',UserAut.login_get);
UserAuth.post('/login', UserAut.login_post);
UserAuth.get('/register', UserAut.signup_get);
UserAuth.post('/register', UserAut.signup_post);
UserAuth.get('/logout', UserAut.logout_get);
UserAuth.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = UserAuth