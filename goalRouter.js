const express = require('express');
const router = express.Router();
const { userCheck } = require('./userRouter');
const goalController = require('./controllers/goalController');

// Get all goals for the logged-in user
router.get('/goals', userCheck, goalController.getAllGoals);

// Create a new goal
router.post('/goals', userCheck, goalController.createGoal);

// Update an existing goal
router.put('/goals/:id', userCheck, goalController.updateGoal);

// Delete a goal
router.delete('/goals/:id', userCheck, goalController.deleteGoal);

module.exports = router; 