const User = require('../models/User');
const { Op } = require('sequelize');

// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// User authentication check
const userCheck = (req, res, next) => {
  const user = req.session.user;
  if (!user) {
    res.status(401).send("User Authentication Failed!");
  } else {
    next();
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    // Check if password matches confirmation
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).render('register', { 
        error: "Passwords don't match",
        formData: req.body 
      });
    }
    
    // Check if email or username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.email },
          { username: req.body.username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).render('register', { 
        error: "Email or username already exists",
        formData: req.body 
      });
    }
    
    const newUser = await User.createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      termsAccepted: req.body.terms === 'on'
    });
    
    // Set session and redirect
    req.session.user = {
      id: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    };
    
    res.redirect('/financial');
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Stack trace:", error.stack);
    if (error.name === 'SequelizeValidationError') {
      console.error("Validation errors:", error.errors);
    }
    res.status(500).render('register', { 
      error: "An error occurred during registration: " + error.message,
      formData: req.body 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email });
    const user = await User.findUser(email, password);
    
    if (!user) {
      console.log("Login failed: Invalid credentials");
      return res.status(401).render('login', { 
        error: "Invalid email/username or password" 
      });
    }
    
    console.log("Login successful for user:", user.username);
    
    // Set session and redirect
    req.session.user = {
      id: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    res.redirect('/financial');
  } catch (error) {
    console.error("Login error:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).render('login', { 
      error: "An error occurred during login: " + error.message
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect('/');
  });
};

module.exports = {
  register,
  login,
  logout,
  userCheck,
  authMiddleware
}; 