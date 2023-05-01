const {IdentityKeyPair, SignedPreKeyRecord, PreKeyRecord, PublicKey, ProtocolAddress} = require("@signalapp/libsignal-client");
const fs = require("fs");

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

function deserialiseLocalUser(username) {

    const appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    let localUser = JSON.parse(fs.readFileSync(appdata + "\\electron\\" + username + ".json", 'utf8'));

    return {
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

function deletePreKey(username) {
    const appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    let localUser = JSON.parse(fs.readFileSync(appdata + "\\electron\\" + username + ".json", 'utf8'));
    let preKeys = localUser.preKeys.map(function (e) {
        return deserialisePreKey(e);
    });
    preKeys.shift();
    fs.writeFile(appdata + "\\electron\\" + username + ".json", JSON.stringify({
        identityKeyPair: localUser.identityKeyPair,
        registrationId: localUser.registrationId,
        preKeys: preKeys,
        signedPreKey: localUser.signedPreKey
    }), 'utf8', (err) => {
        if (err) throw err;
    });
}

module.exports = {
    deserialiseRemoteUser,
    deserialiseLocalUser,
};