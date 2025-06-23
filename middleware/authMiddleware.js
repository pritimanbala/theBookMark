const jwt = require('jsonwebtoken');
require('dotenv').config();


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

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