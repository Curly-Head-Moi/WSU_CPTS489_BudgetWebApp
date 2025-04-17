const express = require("express");
const router = express.Router();
const path = require('path');
const transactionController = require('./controllers/transactionController');

// Apply auth check to all routes in this router
router.use(transactionController.authCheck);

// Static files for the router
router.use(express.static(path.join(__dirname, 'public')));

// Get all transactions for the logged-in user
router.get("/", transactionController.getAllTransactions);

// Create a new transaction
router.post("/", transactionController.createTransaction);

// Update an existing transaction
router.post("/update/:id", transactionController.updateTransaction);

// Delete a transaction
router.post("/delete/:id", transactionController.deleteTransaction);

module.exports = router; 