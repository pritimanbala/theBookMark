const User = require("../schemas/user");
const mongoose = require("mongoose"); 
const jwt = require("jsonwebtoken");
require('dotenv').config();


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: "" };

    if (err.message === "Incorrect Email"){
        errors.email = "That email is not registered"
    }

    if (err.message === "Incorrect Password"){
        errors.password = "That password is incorrect"
    }


    if (err.code === 11000) {
        errors.email = "Email already exists and problem is through here";
        return errors;
    }

    if(err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}
const maxTime = 2*24*60*60;
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: maxTime
    })
}

module.exports.login_get = (req, res) => {
    res.render("login");
}
module.exports.login_post = async (req, res) => {
    const user = req.body;
    const email = user.email;
    const password = user.password;
    console.log("Login attempt for user:", email);
    console.log("Password", password);
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxTime * 1000 });
        req.session.user = user.toObject();
        res.status(201).json({ redirect: "/dashboard" });
    }catch (err) {
        const errors = handleErrors(err);
        res.status(500).json({errors});
    }
}
module.exports.signup_post = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;
        console.log(email, password);
        //upto here its fine
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("Already exists?", existingUser);
            return res.status(400).json({ errors: { email: "Email already exists" } });
        }
        //problem is not here in the existing user block
        const user = await User.create({ email: email, password : password}); //problem is here for sure
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