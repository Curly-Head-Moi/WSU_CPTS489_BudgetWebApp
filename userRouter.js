const express = require("express");
const router = express.Router();

function userCheck(req, res, next){
    const user = req.session.user;
    if (!user){
        res.status(401).send("User Authentication Failed!");
    } else {
        next();
    }
}

router.use("*", (req, res, next) => {
    next();
});

router.get("/financial", (req, res) => {
    // const user = req.session.user;
    
})