const Transaction = require('../models/Transaction');

// Authentication middleware for transactions
const authCheck = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).redirect('/login');
  }
  next();
};

// Get all transactions for the logged-in user
const getAllTransactions = async (req, res) => {
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
};

const createTransaction = async (req, res) => {
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
};

const updateTransaction = async (req, res) => {
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
};

const deleteTransaction = async (req, res) => {
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
};

module.exports = {
  authCheck,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
}; 