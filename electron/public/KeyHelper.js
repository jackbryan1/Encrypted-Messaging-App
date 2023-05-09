const {IdentityKeyPair, SignedPreKeyRecord, PreKeyRecord, PublicKey, ProtocolAddress, PrivateKey} = require("@signalapp/libsignal-client");
const fs = require("fs");
const {readUser, writeUser} = require("./FileHelper");
const crypto = require("crypto");

const maxVal = 16777215;

function deserialiseIdentityKeyPair(identityKeyPair) {
    return IdentityKeyPair.deserialize(Buffer.from(identityKeyPair));
}

function deserialisePublicKey(publicKey) {
    return PublicKey.deserialize(Buffer.from(publicKey));
}

function deserialiseSignedPreKey(signedPreKey) {
    return SignedPreKeyRecord.deserialize(Buffer.from(signedPreKey));
}

function deserialisePreKey(preKeyRecord) {
    return PreKeyRecord.deserialize(Buffer.from(preKeyRecord));
}

function serialisePreKey(preKey) {
    preKey.serialize();
}

function deserialiseLocalUser(username) {
    const localUser = readUser(username);
    return {
        name: localUser.name,
        identityKey: deserialiseIdentityKeyPair(Buffer.from(localUser.identityKeyPair)),
        registrationId: localUser.registrationId,
        preKeys: localUser.preKeys.map(function (e) {
            return deserialisePreKey(e);
        }),
        signedPreKey: deserialiseSignedPreKey(Buffer.from(localUser.signedPreKey)),
        address: ProtocolAddress.new(username, 0),
    }
}

function deserialiseRemoteUser(remoteUser) {
    return {
        name: remoteUser.name,
        registrationId: remoteUser.registrationId,
        publicIdentityKey: deserialisePublicKey(remoteUser.publicIdentityKey),
        signedPreKeyId: remoteUser.signedPreKeyId,
        signedPreKeyPublicKey: deserialisePublicKey(remoteUser.signedPreKeyPublicKey),
        signedPreKeySignature: Buffer.from(remoteUser.signedPreKeyRecordSignature),
        preKeys: remoteUser.preKeys.map(function(e) {
            return deserialisePreKey(e);
        })
    }
}

function serialiseRemoteUser(remoteUser) {
    return {
        name: remoteUser.name,
        registrationId: remoteUser.registrationId,
        publicIdentityKey: remoteUser.publicIdentityKey.serialize(),
        signedPreKeyId: remoteUser.signedPreKeyId,
        signedPreKeyPublicKey: remoteUser.signedPreKeyPublicKey.serialize(),
        signedPreKeySignature: remoteUser.signedPreKeyRecordSignature,
        preKeys: remoteUser.preKeys.map(function(e) {
            return e.serialize();
        })
    }
}

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

function replacePreKey(username, preKeyId) {

    const localUser = readUser(username);

    let keys = localUser.preKeys.map(function (e) {
        return deserialisePreKey(e);
    })

    for (const key of keys) {
        if (key.id() === preKeyId) {
            keys.splice(keys.indexOf(key), 1);
        }
    }

    const preKey = generatePreKeys(crypto.randomBytes(4).readUInt32BE(0), 1);

    const allKeys = keys.concat(preKey)
    const writeKeys = allKeys.map(function(e) {
        return e.serialize();
    });

    writeUser(username, localUser.identityKeyPair, localUser.registrationId, writeKeys, localUser.signedPreKey);
}

module.exports = {
    deserialiseRemoteUser,
    deserialiseLocalUser,
    serialiseRemoteUser,
    generateKeys,
    replacePreKey,
};