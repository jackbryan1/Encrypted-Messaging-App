class LocalUser {
    constructor(identityKey, registrationId, preKeys, signedPreKey, address) {
        this.identityKey = identityKey;
        this.registrationId = registrationId;
        this.preKeys = preKeys;
        this.signedPreKey = signedPreKey;
        this.address = address;
    }

}