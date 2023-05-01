const {IdentityKeyStore, SessionStore, signalEncrypt, ProtocolAddress, SessionRecord, PreKeyBundle,
    processPreKeyBundle, PreKeyStore, SignedPreKeyStore, PreKeySignalMessage, signalDecryptPreKey,
    SignedPreKeyRecord, PreKeyRecord
} = require("@signalapp/libsignal-client");

class Session {
    constructor(localUser, remoteUser) {
        this.localUser = localUser;
        this.remoteUser = remoteUser;
    }

    async encrypt(message) {

        const remoteAddress = ProtocolAddress.new(this.remoteUser.name, 1);
        const sessionStore = new InMemorySessionStore();
        const identityStore = new InMemoryIdentityKeyStore(this.localUser.identityKey.privateKey, this.localUser.registrationId);

        const remotePreKeyBundle = PreKeyBundle.new(
            this.remoteUser.registrationId,
            1,
            this.remoteUser.preKeys[0].id(),
            this.remoteUser.preKeys[0].publicKey(),
            this.remoteUser.signedPreKeyId,
            this.remoteUser.signedPreKeyPublicKey,
            this.remoteUser.signedPreKeySignature,
            this.remoteUser.publicIdentityKey
        );

        await processPreKeyBundle(
            remotePreKeyBundle,
            remoteAddress,
            sessionStore,
            identityStore
        );

        const encrypted = await signalEncrypt(Buffer.from(message), remoteAddress, sessionStore, identityStore);
        return encrypted.serialize();
    }

    async decrypt(message) {
        const ciphertext = PreKeySignalMessage.deserialize(message);
        const remoteAddress = ProtocolAddress.new(this.remoteUser.name, 1);

        const sessionStore = new InMemorySessionStore();
        const identityStore = new InMemoryIdentityKeyStore(this.localUser.identityKey.privateKey, this.localUser.registrationId);
        const preKeyStore = new InMemoryPreKeyStore();
        await preKeyStore.savePreKey(this.localUser.preKeys[0].id(), this.localUser.preKeys[0]);
        const signedPreKeyStore = new InMemorySignedPreKeyStore();
        await signedPreKeyStore.saveSignedPreKey(this.localUser.signedPreKey.id(), this.localUser.signedPreKey);

        const decrypted = await signalDecryptPreKey(ciphertext, remoteAddress, sessionStore, identityStore, preKeyStore, signedPreKeyStore);
        return decrypted;
    }
}

class InMemorySessionStore extends SessionStore {
    state = new Map();
    async saveSession(
        name,
        record
    ) {
        const idx = name.name() + '::' + name.deviceId();
        Promise.resolve(this.state.set(idx, record.serialize()));
    }
    async getSession(
        name
    ) {
        const idx = name.name() + '::' + name.deviceId();
        const serialized = this.state.get(idx);
        if (serialized) {
            return Promise.resolve(
                SessionRecord.deserialize(serialized)
            );
        } else {
            return Promise.resolve(null);
        }
    }
    async getExistingSessions(
        addresses
    ){
        return addresses.map((address) => {
            const idx = address.name() + '::' + address.deviceId();
            const serialized = this.state.get(idx);
            if (!serialized) {
                throw 'no session for ' + idx;
            }
            return SessionRecord.deserialize(serialized);
        });
    }
}

class InMemoryIdentityKeyStore extends IdentityKeyStore {
    idKeys = new Map();
    localRegistrationId;
    identityKey;

    constructor(identityKey, localRegistrationId) {
        super();
        this.identityKey = identityKey;
        this.localRegistrationId = localRegistrationId;
    }

    async getIdentityKey() {
        return Promise.resolve(this.identityKey);
    }
    async getLocalRegistrationId() {
        return Promise.resolve(this.localRegistrationId);
    }

    async isTrustedIdentity(
        name,
        key,
        _direction
    ) {
        const idx = name.name() + '::' + name.deviceId();
        if (this.idKeys.has(idx)) {
            const currentKey = this.idKeys.get(idx);
            return Promise.resolve(currentKey.compare(key) == 0);
        } else {
            return Promise.resolve(true);
        }
    }

    async saveIdentity(
        name,
        key
    ) {
        const idx = name.name() + '::' + name.deviceId();
        const seen = this.idKeys.has(idx);
        if (seen) {
            const currentKey = this.idKeys.get(idx);
            const changed = currentKey.compare(key) != 0;
            this.idKeys.set(idx, key);
            return Promise.resolve(changed);
        }

        this.idKeys.set(idx, key);
        return Promise.resolve(false);
    }
    async getIdentity(
        name
    ) {
        const idx = name.name() + '::' + name.deviceId();
        if (this.idKeys.has(idx)) {
            return Promise.resolve(this.idKeys.get(idx));
        } else {
            return Promise.resolve(null);
        }
    }
}

class InMemoryPreKeyStore extends PreKeyStore {
    state = new Map();
    async savePreKey(
        id,
        record
    ) {
        Promise.resolve(this.state.set(id, record.serialize()));
    }
    async getPreKey(id) {
        return Promise.resolve(
            PreKeyRecord.deserialize(this.state.get(id))
        );
    }
    async removePreKey(id) {
        this.state.delete(id);
        return Promise.resolve();
    }
}

class InMemorySignedPreKeyStore extends SignedPreKeyStore {
    state = new Map();
    async saveSignedPreKey(
        id,
        record
    ) {
        Promise.resolve(this.state.set(id, record.serialize()));
    }
    async getSignedPreKey(id) {
        return Promise.resolve(
            SignedPreKeyRecord.deserialize(this.state.get(id))
        );
    }
}

module.exports = {
    Session
};