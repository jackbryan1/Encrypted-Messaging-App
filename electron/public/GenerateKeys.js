const {IdentityKeyPair, PreKeyRecord, PrivateKey, SignedPreKeyRecord} = require('@signalapp/libsignal-client');
const crypto = require("crypto");

const maxVal = 16777215;

function generateIdentityKeyPair() {
    return IdentityKeyPair.generate();
}
function generateRegistrationId() {
    return crypto.randomBytes(4).readUInt32BE(0);
}

function generateSignedPreKey(identityKeyPair, signedPreKeyId) {
    let privateKey = PrivateKey.generate();
    let signature = identityKeyPair.privateKey.sign(privateKey.getPublicKey().serialize());
    return SignedPreKeyRecord.new(signedPreKeyId, Date.now(), privateKey.getPublicKey(), privateKey, signature);
}

function generatePreKeys(start, count) {
    const keys = [];
    for (let i = 0; i < count; i++) {
        let id = ((start + i) % (maxVal-1)) + 1;
        let privateKey = PrivateKey.generate();
        let publicKey = privateKey.getPublicKey();
        keys.push(PreKeyRecord.new(id, publicKey, privateKey).serialize());
    }
    return keys;
}

function generateKeys() {
    const identityKeyPair = generateIdentityKeyPair();
    const registrationId = generateRegistrationId();
    const signedPreKey = generateSignedPreKey(identityKeyPair, crypto.randomBytes(4).readUInt32BE(0));
    const preKeys = generatePreKeys(crypto.randomBytes(4).readUInt32BE(0), 100);
    return {identityKeyPair: identityKeyPair.serialize(), registrationId: registrationId, signedPreKey: signedPreKey.serialize(), preKeys: preKeys};
}

module.exports = {
    generateKeys
};
