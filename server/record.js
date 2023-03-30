const express = require("express");

const router = express.Router();

const User = require("./User");

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
    res.json(await User.findOne({ name: req.query.name}).exec());
});

router.post("/message", async (req, res) => {
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

module.exports = router;