const express = require("express");

const router = express.Router();

const User = require("./User");

router.post("/username", async (req, res) => {
    const newUser = new User({
        name: req.body.name
    })
    await newUser.save();
});


module.exports = router;