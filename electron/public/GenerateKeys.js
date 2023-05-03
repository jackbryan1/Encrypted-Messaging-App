const {IdentityKeyPair, PreKeyRecord, PrivateKey, SignedPreKeyRecord, ProtocolAddress} = require('@signalapp/libsignal-client');
const crypto = require("crypto");
const fs = require("fs")
const {writeUser, readUser, writeKeys} = require("./FileHelper");

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
        keys.push(PreKeyRecord.new(id, publicKey, privateKey));
    }
    return keys;
}

function generateKeys(username) {
    const identityKeyPair = generateIdentityKeyPair();
    const registrationId = generateRegistrationId();
    const signedPreKey = generateSignedPreKey(identityKeyPair, crypto.randomBytes(4).readUInt32BE(0));
    const preKeys = generatePreKeys(crypto.randomBytes(4).readUInt32BE(0), 100).map(function(e) {
        return e.serialize();
    });

    writeUser(username, identityKeyPair.serialize(), registrationId, preKeys, signedPreKey.serialize())

    return {identityKeyPair: identityKeyPair.serialize(),
        registrationId: registrationId,
        signedPreKey: signedPreKey.serialize(),
        preKeys: preKeys,
        publicIdentityKey: identityKeyPair.publicKey.serialize(),
        signedPreKeyId: signedPreKey.id(),
        signedPreKeyPublicKey: signedPreKey.publicKey().serialize(),
        signedPreKeyRecordSignature: signedPreKey.signature(),
    };
}

function replacePreKey(username) {

    const localUser = readUser(username);

    const preKey = generatePreKeys(crypto.randomBytes(4).readUInt32BE(0), 1).map(function(e) {
        return e.serialize();
    });

    localUser.preKeys.push(...preKey)

    writeUser(username, localUser.identityKeyPair, localUser.registrationId, localUser.preKeys, localUser.signedPreKey)

    return {
        preKey: preKey,
    }
}

module.exports = {
    generateKeys
};
