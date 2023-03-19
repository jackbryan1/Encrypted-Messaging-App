const {IdentityKeyPair, SignedPreKeyRecord, PreKeyRecord} = require("@signalapp/libsignal-client");

function deserialiseIdentityKeyPair(identityKeyPair) {
    return IdentityKeyPair.deserialize(Buffer.from(identityKeyPair));
}

function deserialiseSignedPreKey(signedPreKey) {
    return SignedPreKeyRecord.deserialize(Buffer.from(signedPreKeyRecord));
}

function deserialisePreKey(preKeyRecord) {
    return PreKeyRecord.deserialize(Buffer.from(preKeyRecord));
}

module.exports = {
};