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
    const message = new Message({
        to: req.body.to,
        from: req.body.from,
        date: req.body.date,
        type: req.body.type,
        message: req.body.message,
    })
    await message.save();
    res.json();
});

router.get("/getMessage", async (req, res) => {
    console.log("get: start");
    const retVal = await Message.find({ to: req.query.name }).exec();
    console.log("get: found");
    Message.deleteMany({ to: req.query.name }).then((result) => {
        //console.log(result);
    });
    console.log("get: deleted");
    res.json(retVal);
});

router.post("/replacePreKey", async (req, res) => {
    console.log("PREKEY: start");
    const user = await User.findOne({ name: req.body.name });
    console.log("PREKEY: found");
    user.preKeys = req.body.preKeys;
    user.save();
    console.log("PREKEY: saved");
    res.json();
});

module.exports = router;