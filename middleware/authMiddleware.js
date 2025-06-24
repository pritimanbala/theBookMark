const jwt = require('jsonwebtoken');
require('dotenv').config();

//creating a function for checking everystep
const requireAuth = (req, res, next) => {
    //collecting token from the browser
    const token = req.cookies.jwt;
    //checking is token there or not
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodeToken)=>{
            if(err){
                console.log(err);
                res.redirect("/login")
            }else{
                console.log(decodeToken);
                next();
            }
        })
    }else{
        res.redirect("/login");
    }
}

module.exports = requireAuth;