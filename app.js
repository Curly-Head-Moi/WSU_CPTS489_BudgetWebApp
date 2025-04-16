// Reqs
const express = require('express');
const bodyParser = require('body-parser');  // for parsing form data
const path = require('path');
const session = require('express-session');

//DB
const sequelize = require('./db');

// Import routes
const userRouter = require('./userRouter');

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

// Use routers
app.use('/user', userRouter);

// Authentication middleware for protected routes
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  // if (req.session && req.session.user) {
  //   res.render('index');
  // } else {
  //   res.sendFile(path.join(__dirname, 'public', 'index.html'));
  // }
  res.render('index');
});

app.get('/index', (req, res) => {
  res.render('index');
});

// Protected routes
app.get('/financial', authMiddleware, (req, res) => {
  res.render('financial', { user: req.session.user });
});

app.get('/manage', authMiddleware, (req, res) => {
  res.render('manage', { user: req.session.user });
});

app.get('/transactions', authMiddleware, (req, res) => {
  res.render('transactions', { user: req.session.user });
});

// Authentication routes
app.get('/register', (req, res) => {
  res.render('register', { error: null, formData: {} });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
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
