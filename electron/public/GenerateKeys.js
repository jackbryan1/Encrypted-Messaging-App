const {IdentityKeyPair, PreKeyRecord, PrivateKey, SignedPreKeyRecord} = require('@signalapp/libsignal-client');
const crypto = require("crypto");
const fs = require("fs")

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

    const appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

    fs.writeFile(appdata + "\\electron\\" + username + ".json", JSON.stringify({
        identityKeyPair: identityKeyPair.serialize(),
        registrationId: registrationId,
        preKeys: preKeys,
        signedPreKey: signedPreKey.serialize()
    }), 'utf8', (err) => {
        if (err) throw err;
    });

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

module.exports = {
    generateKeys
};
