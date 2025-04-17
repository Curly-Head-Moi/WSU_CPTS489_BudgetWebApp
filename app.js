// Reqs
const express = require('express');
const bodyParser = require('body-parser');  // for parsing form data
const path = require('path');
const session = require('express-session');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize  = require('@adminjs/sequelize');
const bcrypt = require('bcrypt');
//DB
const sequelize = require('./db');
const User = require('./models/User'); // path to the model
// Import routes
const userRouter = require('./userRouter');
const transactionRouter = require('./transactionRouter');
const goalRouter = require('./goalRouter');
const budgetRouter = require("./budgetRouter");
const Goal = require('./models/Goal');
const Transaction = require('./models/Transaction');

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

AdminJS.registerAdapter(AdminJSSequelize);
const adminJs = new AdminJS({
  databases: [sequelize],          // auto‑load every table
  rootPath : '/admin',
  resources: [
    {
      resource: User,
      options : {
        properties: {
          password: { isVisible: false }, // hide pwd column in list/show
        },
        actions: {
          new: {
            // hash the password before saving if the admin creates a user
            before: async (req) => {
              if (req.payload?.password) {
                req.payload.password = await bcrypt.hash(req.payload.password, 10);
              }
              return req;
            },
          },
        },
      },
    },
  ],
});
const router = AdminJSExpress.buildAuthenticatedRouter( //User must be admin to access admin panel with normal credentials
  adminJs,
  {
    cookieName   : 'adminjs',
    cookiePassword: 'asuiflasdjkfbhapiulvbpaiusdflasdfasuifajsdbfaulif284y209401348', //not same as admin password
    authenticate : async (email, password) => {
      const user = await User.findOne({ where: { email } });
      if (
        user &&                       
        user.isAdmin &&
        (await bcrypt.compare(password, user.password))
      ) {
        return user;                 
      }
      return false;              
    },
  },
  null,
  { resave: false, saveUninitialized: false },
);
app.use(adminJs.options.rootPath, router);




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
app.get('/financial', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.session.user.id;
    const goals = await Goal.findByUser(userEmail);
    const transactions = await Transaction.findByOwner(userEmail);
    
    // Calculate spending for each category
    const spending = {};
    const totalGoal = goals.find(g => g.category === 'total');
    let totalSpent = 0;
    
    // Initialize spending for each category
    transactions.forEach(transaction => {
      if (transaction.transactionType === 'Expense') {
        totalSpent += transaction.amount;
        
        // Track category spending
        if (!spending[transaction.category]) {
          spending[transaction.category] = 0;
        }
        spending[transaction.category] += transaction.amount;
      }
    });
    
    res.render('financial', { 
      goals: goals || [], 
      spending: spending,
      totalSpent: totalSpent,
      totalGoal: totalGoal
    });
  } catch (error) {
    console.error("Error loading financial data:", error);
    res.status(500).render('financial', { 
      goals: [],
      spending: {},
      totalSpent: 0,
      totalGoal: null,
      error: "Failed to load financial data"
    });
  }
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
(async () => { //For Testing/demo
  const hashed = await bcrypt.hash('123123', 10);   
  await User.create({
    firstName : 'blah',
    lastName  : 'blah',
    username  : 'blah',
    email     : 'blah@1.com',
    password  : hashed,            
    isAdmin   : true,
    termsAccepted: true,
  });
  console.log('admin user created');
})();

// use alter:true for to preserve data
// use force:true to completely rebuild the database
sequelize.sync({ force: true }).then(()=>{
  console.log("Sequelize Sync Completed...");
  setup().then(()=> console.log("User setup complete"))
})
