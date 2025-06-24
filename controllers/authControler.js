const User = require("../schemas/user");
const mongoose = require("mongoose"); 
const jwt = require("jsonwebtoken");
require('dotenv').config();


const handleErrors = (err) => {
    //checking the error object
    console.log(err.message, err.code);
    let errors = { email: "", password: "" };
    //taking down different cases of errors
    if (err.message === "Incorrect Email"){
        errors.email = "That email is not registered"
    }
    if (err.message === "Incorrect Password"){
        errors.password = "That password is incorrect"
    }

    //special error with error code
    if (err.code === 11000) {
        errors.email = "Email already exists and problem is through here";
        return errors;
    }
    //setting up error message
    if(err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}
//created a jwt token for the next processes through sign method of jwt
const maxTime = 2*24*60*60;
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: maxTime
    })
}
//made functions for userAuthentication
module.exports.login_get = (req, res) => {
    res.render("login");
}
module.exports.login_post = async (req, res) => {
    const user = req.body;
    const email = user.email;
    const password = user.password;
    console.log("Login attempt for user:", email);
    console.log("Password", password);
    //tried to console out for any possible problems in future
    try {
        const user = await User.login(email, password);//here we used the static funcion here
        const token = createToken(user._id);                    //created a token through cookie
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxTime * 1000 });
        req.session.user = user.toObject();                     //saved the userdetails in a object form
        res.status(201).json({ redirect: "/dashboard" });
    }catch (err) {
        const errors = handleErrors(err);
        res.status(500).json({errors});
    }
}
module.exports.signup_post = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase(); //we trimmed it so that no space remains while
        const password = req.body.password;
        console.log('new user',email, password);
        //upto here its fine
        // if you are getting duplicated email with null perspective na, check once the indexes of your collection
        const existingUser = await User.findOne({ email });
        //just checking user exists or not
        if (existingUser) {
            console.log("Already exists?", existingUser);
            return res.status(400).json({ errors: { email: "Email already exists" } });
        }
        const user = await User.create({ email: email, password : password}); 
        console.log("its okay here too")
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxTime * 1000 });
        req.session.user = user.toObject();
        res.status(201).json({ redirect: "/dashboard" });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(500).json({ errors });
    }
}

module.exports.signup_get = (req, res) => {
    res.render("signup");
} 



module.exports.logout_get = (req, res) => {
    //destroying the cookie and the session
    res.cookie('jwt', '', {maxAge: 1});
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("User logged out successfully");
        res.redirect("/login");
    });
}