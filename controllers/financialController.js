const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// Get financial dashboard data
const getFinancialDashboard = async (req, res) => {
  try {
    const userEmail = req.session.user.id;
    const goals = await Goal.findByUser(userEmail);
    const transactions = await Transaction.findByOwner(userEmail);
    
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
};

module.exports = {
  getFinancialDashboard
}; 