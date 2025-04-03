// app.js
const express = require('express');
const bodyParser = require('body-parser');  // for parsing form data
const db = require('./db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('index', { signatures: rows });
});

app.get('*', (req, res) => { //For general route handling
  // Remove leading slash
  const requestedView = req.path.replace(/^\/+/, '');
  const ejsPath = path.join(__dirname, 'views', `${requestedView}.ejs`);

  // Check if an EJS file exists matching the path
  fs.access(ejsPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.send('404 Not Found');
    }
    res.render(requestedView);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
