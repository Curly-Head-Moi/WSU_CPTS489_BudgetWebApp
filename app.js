// Reqs
const express = require('express');
const bodyParser = require('body-parser');  // for parsing form data
const path = require('path');
const session = require('express-session');

//DB
const sequelize = require('./db');
const User = require('./models/User')
const Transaction = require('./models/Transaction')
const Goal = require('./models/Goal')


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

app.get('/financial', (req, res) => {
  res.render('financial');
});

app.get('/manage', (req, res) => {
  res.render('manage');
});

app.get('/support', (req, res) => {
  res.render('support');
});

app.get('/transactions', (req, res) => {
  res.render('transactions');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
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
  //const subu = await User.create({ username: "subu", password: "1234" });
  console.log("setup test...")
  // const webdev = await Course.create(
  //   {
  //     courseid: "CPTS489",
  //     coursename: "Web Development",
  //     semester: "Spring",
  //     coursedesc: "Introduction to Web Development",
  //     enrollnum: 80
  //   }
  // )
}

sequelize.sync().then(()=>{
  console.log("Sequelize Sync Completed...");
  setup().then(()=> console.log("User setup complete"))
})
