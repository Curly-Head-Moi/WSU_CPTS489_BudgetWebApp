const express = require("express");
const router = express.Router();
const Budget = require("./models/Budget");
const path = require("path");
const { userCheck } = require("./userRouter");

// authentication functionality
function authCheck(req, res, next) {
    if (!req.session.user) {
        return res.status(401).redirect("/login");
    }
    next();
}

// Apply authentication to all routes
router.use(authCheck);

// link static files to router
router.use(express.static(path.join(__dirname, 'public')));

// collect all budgets tied to the current user
router.get('/manage', userCheck, async (req, res) => {
    try {
        const budgets = await Budget.findByUser(req.session.user.id);
        res.json(budgets);
    } catch (error) {
        console.error('Error retrieving user budgets: ', error);
        res.status(500).json({ message: "Failed to retrieve current user's budgets", error : error.message});
    }
});

// create new budget
router.post("/manage", userCheck, async (req, res) => {
    try {
        const {budgetName, description, amount, category} = req.body;

        // validate user input
        if (!amount || amount < 0 || !category || !budgetName) {
            return res.status(400).json({message: "Invalid input"});
        }
    
        // validation continued: check if budget already exists
        const budgetExists = await Budget.findOne({
            where: {
                userId : req.session.user.id,
                budgetName : budgetName
            }
        });
        if (budgetExists) {
            return res.status(400).json({ message: 'A budget with this name already exists! Please use a different name.'});
        }
    
        // validation completed; Process to add a new budget
        const newBudgetData = {
            userEmail: req.session.user.id,
            budgetName: req.body.budgetName,
            category: req.body.category,
            amount: parseFloat(req.body.amount),
            date: req.body.date || new Date(),
            description: req.body.description,
        };
        await Budget.createBudget(newBudgetData);
        res.redirect('/manage');
    } catch (error) {
        console.error("Error creating budget: ", error);
        const budgets = await Budget.findByUser(req.session.user.id);
        res.status(500).render('budgets', {
            budgets: budgets || [],
            error: 'Failed to create budget: ' + error.message
        });
    }

});

// update an existing budget
router.post("/manage/:id", userCheck, async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const budgetID = req.params.id;
        const budgetData = {
            budgetName: req.body.budgetName,
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            category: req.body.category,
            date : req.body.date
        };

        // validate user input
        if (!budgetData.budgetName || !budgetData.category || !budgetData.amount || budgetData.amount < 0) {
            return res.status(400).json({ message: "One or more inputs are of invalid types."});
        }

        // find the requested goal
        const requestedBudget = await Budget.findOne({
            where: {
                id: budgetID,
                userEmail: userEmail
            }
        });
        
        if (!requestedBudget) {
            return res.status(404).json({ message: "Budget was not found and/or authorized to updated."});
        }

        // If validation passed, update goal
        await Budget.updateBudget(budgetID, budgetData, userEmail);
        res.redirect("/manage");

    } catch (error) {
        console.error("Error updated budget: ", error);
        const budgets = await Budget.findByUser(req.session.user.id);
        res.status(500).render("budgets", {
            budgets : budgets || [],
            error: "Failed to update user budgets: " + error.message
        });
    }
});

// Deleting a user budget
router.post("/manage/:id", userCheck, async (req, res) => {
    try {
        const userEmail = req.session.user.id;
        const budgetID = req.params.id;

        await Budget.deleteBudget(budgetID, userEmail);
        res.redirect("/manage");
    } catch (error) {
        console.error("Error deleting budget: ", error);
        const budgets = await Budget.findByUser(req.session.user.id);
        res.status(500).render('budgets', {
            budgets: budgets,
            error: "Failed to delete user budget: " + error.message
        });
    }
});

module.exports = router;