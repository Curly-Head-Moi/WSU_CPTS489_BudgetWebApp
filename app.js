// Reqs
const express = require('express');
const bodyParser = require('body-parser');  // for parsing form data
const path = require('path');
const session = require('express-session');

//DB
const sequelize = require('./db');

// Import routes
const userRouter = require('./userRouter');
const transactionRouter = require('./transactionRouter');
const goalRouter = require('./goalRouter');
const budgetRouter = require("./budgetRouter");

const PORT = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for session
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true
}));

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Use routers
app.use('/user', userRouter);
app.use('/transactions', transactionRouter);
app.use('/manage', goalRouter);

// Authentication middleware for protected routes
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/index', (req, res) => {
  res.render('index');
});

// Protected routes
app.get('/financial', authMiddleware, (req, res) => {
  res.render('financial');
});

app.get('/manage', authMiddleware, (req, res) => {
  res.render('manage');
});

// Authentication routes
app.get('/register', (req, res) => {
  res.render('register', { error: null, formData: {} });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect('/');
  });
});

app.get('/support', (req, res) => {
  res.render('support');
});

//404 for all other routes
app.use((req, res) => {
  //res.status(404).render('404');
  res.send("404 Not Found");
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function setup() {
  console.log("setup test...")
}

// use alter:true for to preserve data
// use force:true to completely rebuild the database
sequelize.sync({ force: true }).then(()=>{
  console.log("Sequelize Sync Completed...");
  setup().then(()=> console.log("User setup complete"))
})
