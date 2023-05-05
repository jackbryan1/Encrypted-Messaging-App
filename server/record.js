const express = require("express");

const router = express.Router();

const User = require("./User");
const Message = require("./Message");

router.post("/register", async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        registrationId: req.body.registrationId,
        publicIdentityKey: req.body.publicIdentityKey,
        signedPreKeyId: req.body.signedPreKeyId,
        signedPreKeyPublicKey: req.body.signedPreKeyPublicKey,
        signedPreKeyRecordSignature: req.body.signedPreKeyRecordSignature,
        preKeys: req.body.preKeys,
    })
    await newUser.save();
});

router.get("/getUser", async (req, res) => {
    const retVal = await User.findOne({ name: req.query.name }).exec();
    res.json(retVal);
});

router.post("/sendMessage", async (req, res) => {
    console.log(req.body);
    const message = new Message({
        to: req.body.to,
        from: req.body.from,
        date: req.body.date,
        message: req.body.message,
    })
    await message.save();
});

router.get("/getMessage", async (req, res) => {
    const retVal = await Message.find({ to: req.query.name }).exec();
    await Message.deleteMany({ to: req.query.name }).exec();
    res.json(retVal);
});

router.post("/replacePreKey", async (req, res) => {
    const retVal = await Message.find({ to: req.query.name }).exec();
    res.json(retVal);
});

module.exports = router;