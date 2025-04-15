const express = require("express");
const router = express.Router();
const Transaction = require("./models/Transaction");
const path = require('path');

// Authentication middleware for this router
function authCheck(req, res, next) {
    if (!req.session.user) {
        return res.status(401).redirect('/login');
    }
    next();
}

// Apply auth check to all routes in this router
router.use(authCheck);

// Static files for the router
router.use(express.static(path.join(__dirname, 'public')));

// Get all transactions for the logged-in user
router.get("/", async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const transactions = await Transaction.findByOwner(userEmail);
        res.render('transactions', { 
            transactions: transactions || []
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).render('transactions', { 
            transactions: [],
            error: "Failed to load transactions"
        });
    }
});

// Create a new transaction
router.post("/", async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const transactionData = {
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            transactionType: req.body.transactionType,
            category: req.body.category,
            date: req.body.date || new Date(),
            userEmail: userEmail
        };
        
        await Transaction.createTransaction(transactionData);
        res.redirect('/transactions');
    } catch (error) {
        console.error("Error creating transaction:", error);
        const transactions = await Transaction.findByOwner(req.session.user.id);
        res.status(500).render('transactions', { 
            transactions: transactions || [],
            error: "Failed to create transaction: " + error.message
        });
    }
});

// Update an existing transaction
router.post("/update/:id", async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const id = req.params.id;
        const transactionData = {
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            transactionType: req.body.transactionType,
            category: req.body.category,
            date: req.body.date
        };
        
        await Transaction.updateTransaction(id, transactionData, userEmail);
        res.redirect('/transactions');
    } catch (error) {
        console.error("Error updating transaction:", error);
        const transactions = await Transaction.findByOwner(req.session.user.id);
        res.status(500).render('transactions', { 
            transactions: transactions || [],
            error: "Failed to update transaction: " + error.message
        });
    }
});

// Delete a transaction
router.post("/delete/:id", async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const id = req.params.id;
        
        await Transaction.deleteTransaction(id, userEmail);
        res.redirect('/transactions');
    } catch (error) {
        console.error("Error deleting transaction:", error);
        const transactions = await Transaction.findByOwner(req.session.user.id);
        res.status(500).render('transactions', { 
            transactions: transactions || [],
            error: "Failed to delete transaction: " + error.message
        });
    }
});

module.exports = router; 