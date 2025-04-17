const Goal = require('../models/Goal');

// Get all goals for the logged-in user
const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findByUser(req.session.user.id);
    res.json(goals);
  } catch (error) {
    console.error('Error retrieving goals:', error);
    res.status(500).json({ message: 'Failed to retrieve goals', error: error.message });
  }
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { category, amount } = req.body;
    
    if (!category || !amount || amount < 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    // Check if goal for this category already exists
    const existingGoal = await Goal.findOne({
      where: { 
        userId: req.session.user.id,
        category: category
      }
    });
    
    if (existingGoal) {
      return res.status(400).json({ message: 'A goal for this category already exists. Use PUT to update it.' });
    }
    
    const newGoal = await Goal.create({
      userId: req.session.user.id,
      category,
      amount
    });
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Failed to create goal', error: error.message });
  }
};

// Update an existing goal
const updateGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goalId = req.params.id;
    
    if (!amount || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Find the goal and ensure it belongs to the user
    const goal = await Goal.findOne({
      where: { 
        id: goalId,
        userId: req.session.user.id
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or not authorized' });
    }
    
    goal.amount = amount;
    await goal.save();
    
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    // Find and delete the goal, ensuring it belongs to the user
    const deletedCount = await Goal.destroy({
      where: { 
        id: goalId,
        userId: req.session.user.id
      }
    });
    
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Goal not found or not authorized to delete' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Failed to delete goal', error: error.message });
  }
};

module.exports = {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal
}; 