class RemoteUser {
    constructor(preKeyId, preKeyPublicKey, signedPreKeyId, signedPreKeyPublicKey, signedPreKeySignature, identityKeyPairPublicKey, deviceId, name, registrationId) {
        this.preKeyId = preKeyId;
        this.preKeyPublicKey = preKeyPublicKey;
        this.signedPreKeyId = signedPreKeyId;
        this.signedPreKeyPublicKey = signedPreKeyPublicKey;
        this.signedPreKeySignature = signedPreKeySignature;
        this.identityKeyPairPublicKey = identityKeyPairPublicKey;
        this.deviceId = deviceId;
        this.name = name;
        this.registrationId = registrationId;
    }
}