const express = require("express");
const router = express.Router();
const path = require('path');
const userController = require('./controllers/userController');

// Static files for the router
router.use(express.static(path.join(__dirname, 'public')));

// Handle views
router.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl;
    next();
});

// Register new user
router.post("/register", userController.register);

// Login user
router.post("/login", userController.login);

// Financial page (protected)
router.get("/financial", userController.userCheck, (req, res) => {
    res.render('financial');
});

module.exports = router;
module.exports.userCheck = userController.userCheck;