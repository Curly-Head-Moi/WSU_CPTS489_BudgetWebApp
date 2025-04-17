const express = require("express");
const router = express.Router();
const path = require("path");
const { userCheck } = require("./userRouter");
const budgetController = require('./controllers/budgetController');

// Apply authentication to all routes
router.use(budgetController.authCheck);

// link static files to router
router.use(express.static(path.join(__dirname, 'public')));

// collect all budgets tied to the current user
router.get('/manage', userCheck, budgetController.getAllBudgets);

// create new budget
router.post("/manage", userCheck, budgetController.createBudget);

// update an existing budget
router.post("/manage/:id", userCheck, budgetController.updateBudget);

// Deleting a user budget
router.post("/delete/:id", userCheck, budgetController.deleteBudget);

module.exports = router;