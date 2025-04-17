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
// Import controllers
const userController = require('./controllers/userController');
const financialController = require('./controllers/financialController');
// Import routes
const userRouter = require('./routes/userRouter');
const transactionRouter = require('./routes/transactionRouter');
const goalRouter = require('./routes/goalRouter');
const budgetRouter = require("./routes/budgetRouter");
const supportRouter = require("./routes/supportRouter");
const Goal = require('./models/Goal');
const Transaction = require('./models/Transaction');
const SupportInquiry = require('./models/SupportInquiry');

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
    {
      resource: SupportInquiry,
      options: {
        properties: {
          message: {
            type: 'textarea',
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
app.use('/budget', budgetRouter);
app.use('/support', supportRouter);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/index', (req, res) => {
  res.render('index');
});

// Protected routes
app.get('/financial', userController.authMiddleware, financialController.getFinancialDashboard);

app.get('/manage', userController.authMiddleware, (req, res) => {
  res.render('manage');
});

// Authentication routes
app.get('/register', (req, res) => {
  res.render('register', { error: null, formData: {} });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.get('/logout', userController.logout);

app.get('/support', (req, res) => {
  res.render('support', { error: null, success: null, formData: {} });
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
