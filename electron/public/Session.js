const {IdentityKeyStore, SessionStore, signalEncrypt, ProtocolAddress, SessionRecord, PreKeyBundle,
    processPreKeyBundle, PreKeyStore, SignedPreKeyStore, PreKeySignalMessage, signalDecryptPreKey,
    SignedPreKeyRecord, PreKeyRecord, signalDecrypt, SignalMessage, PublicKey
} = require("@signalapp/libsignal-client");
const {readStore, writeStore} = require("./FileHelper");

class Session {
    constructor(localUser, remoteUser) {
        this.localUser = localUser;
        this.remoteUser = remoteUser;
    }

    async encrypt(message) {

        const remoteAddress = ProtocolAddress.new(this.remoteUser.name, 1);
        const sessionStore = new InMemorySessionStore(this.localUser.name);
        const identityStore = new InMemoryIdentityKeyStore(this.localUser.identityKey.privateKey, this.localUser.registrationId, this.localUser.name);

        if (!await sessionStore.getSession(remoteAddress)) {
            await this.processPreKey(remoteAddress, sessionStore, identityStore);
        }

        const encrypted = await signalEncrypt(Buffer.from(message), remoteAddress, sessionStore, identityStore);
        return {message: encrypted.serialize(), type: encrypted.type()};
    }

    async processPreKey(remoteAddress, sessionStore, identityStore) {
        const remotePreKeyBundle = this.createPreKeyBundle();

        await processPreKeyBundle(
            remotePreKeyBundle,
            remoteAddress,
            sessionStore,
            identityStore
        );
    }

    createPreKeyBundle() {
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
        return remotePreKeyBundle;
    }

    async decrypt(message, type) {

        const sessionStore = new InMemorySessionStore(this.localUser.name);
        const identityStore = new InMemoryIdentityKeyStore(this.localUser.identityKey.privateKey, this.localUser.registrationId, this.localUser.name);
        const remoteAddress = ProtocolAddress.new(this.remoteUser.name, 1);

        let decrypted;

        if(type === 2) {
            decrypted = this.decryptWithoutPreKey(message, remoteAddress, sessionStore, identityStore);
        } else if(type === 3) {
            decrypted = this.decryptWithPreKey(message, remoteAddress, sessionStore, identityStore);
        } else {
            throw new Error('Invalid Message');
        }
        return decrypted;
    }

    async createSignedPreKeyStore() {
        const signedPreKeyStore = new InMemorySignedPreKeyStore(this.localUser.name);
        await signedPreKeyStore.saveSignedPreKey(this.localUser.signedPreKey.id(), this.localUser.signedPreKey);
        return signedPreKeyStore;
    }

    async createPreKeyStore(ciphertext) {

        let prekey = this.getPreKey(ciphertext);

        const preKeyStore = new InMemoryPreKeyStore(this.localUser.name);
        await preKeyStore.savePreKey(prekey.id(), prekey);
        return preKeyStore;
    }

    getPreKey(ciphertext) {
        for (const key of this.localUser.preKeys) {
            if (key.id() === ciphertext.preKeyId()) {
                return key;
            }
        }
        throw Error("Prekey not found");
    }

    async decryptWithoutPreKey(message, remoteAddress, sessionStore, identityStore) {

        const ciphertext = SignalMessage.deserialize(message);

        const decrypted = await signalDecrypt(ciphertext, remoteAddress, sessionStore, identityStore);
        return decrypted;
    }

    async decryptWithPreKey(message, remoteAddress, sessionStore, identityStore) {

        const ciphertext = PreKeySignalMessage.deserialize(message);

        const preKeyStore = await this.createPreKeyStore(ciphertext);
        const signedPreKeyStore = await this.createSignedPreKeyStore();

        const decrypted = await signalDecryptPreKey(ciphertext, remoteAddress, sessionStore, identityStore, preKeyStore, signedPreKeyStore);
        return decrypted;
    }
}

class InMemorySessionStore extends SessionStore {
    state;
    name;
    constructor(name) {
        super();
        this.name = name;
        this.state = readStore(this.name, "session");
    }
    async saveSession(
        name,
        record
    ) {
        const idx = name.name() + '::' + name.deviceId();
        const retVal = this.state.set(idx, record.serialize());
        writeStore(this.name, "session", retVal);
        Promise.resolve(retVal);
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
    idKeys;
    localRegistrationId;
    identityKey;
    name;

    constructor(identityKey, localRegistrationId, name) {
        super();
        this.identityKey = identityKey;
        this.localRegistrationId = localRegistrationId;
        this.name = name;
        this.idKeys = readStore(this.name, "identity");
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
            const currentKey = PublicKey.deserialize(this.idKeys.get(idx));
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
            const currentKey = PublicKey.deserialize(this.idKeys.get(idx));
            const changed = currentKey.compare(key) != 0;
            writeStore(this.name, "identity", this.idKeys.set(idx, key.serialize()));
            return Promise.resolve(changed);
        }

        writeStore(this.name, "identity", this.idKeys.set(idx, key.serialize()));
        return Promise.resolve(false);
    }
    async getIdentity(
        name
    ) {
        const idx = name.name() + '::' + name.deviceId();
        if (this.idKeys.has(idx)) {
            return Promise.resolve(PublicKey.deserialize(this.idKeys.get(idx)));
        } else {
            return Promise.resolve(null);
        }
    }
}

class InMemoryPreKeyStore extends PreKeyStore {
    state;
    name;
    constructor(name) {
        super();
        this.name = name;
        this.state = readStore(this.name, "prekey");
    }
    async savePreKey(
        id,
        record
    ) {
        const retVal = this.state.set(id, record.serialize());
        writeStore(this.name, "prekey", retVal);
        Promise.resolve(retVal);
    }
    async getPreKey(id) {
        return Promise.resolve(
            PreKeyRecord.deserialize(this.state.get(id))
        );
    }
    async removePreKey(id) {
        this.state.delete(id);
        writeStore(this.name, "prekey", this.state);
        return Promise.resolve();
    }
}

class InMemorySignedPreKeyStore extends SignedPreKeyStore {
    state;
    name;
    constructor(name) {
        super();
        this.name = name
        this.state = readStore(this.name, "signedprekey");
    }
    async saveSignedPreKey(
        id,
        record
    ) {
        const retVal = this.state.set(id, record.serialize());
        writeStore(this.name, "signedprekey", retVal);
        Promise.resolve(retVal);
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