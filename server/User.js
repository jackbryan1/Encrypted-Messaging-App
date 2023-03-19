const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    registrationId: Number,
    publicIdentityKey: Object,
    signedPreKeyId: Number,
    signedPreKeyPublicKey: Object,
    signedPreKeyRecordSignature: Object,
    preKeys: [Object]
});

const User = mongoose.model('User', userSchema);

module.exports = User;