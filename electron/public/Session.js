const {IdentityKeyStore, SessionStore, signalEncrypt, ProtocolAddress, SessionRecord, PreKeyBundle,
    processPreKeyBundle, PreKeyStore, SignedPreKeyStore, SenderKeyStore, PreKeySignalMessage, signalDecryptPreKey,
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
        //const retVal = PreKeySignalMessage(encrypted);
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

class InMemorySenderKeyStore extends SenderKeyStore {
    state = new Map();
    async saveSenderKey(
        sender,
        distributionId,
        record
    ) {
        const idx =
            distributionId + '::' + sender.name() + '::' + sender.deviceId();
        Promise.resolve(this.state.set(idx, record));
    }
    async getSenderKey(
        sender,
        distributionId
    ) {
        const idx =
            distributionId + '::' + sender.name() + '::' + sender.deviceId();
        if (this.state.has(idx)) {
            return Promise.resolve(this.state.get(idx));
        } else {
            return Promise.resolve(null);
        }
    }
}

/*class SessionStoreImpl extends SessionStore {

    store = {};
    constructor( ) {
        super();
    }

    async saveSession(address, record) {
        console.log(JSON.stringify(address));
        return Promise.resolve(this.put(address, record.serialize()));
    }

    async getSession(address) {
        console.log(JSON.stringify(address))
        console.log(this.get(address, new SessionRecord()));
        return Promise.resolve(this.get(address, new SessionRecord()));
    }

    async getExistingSessions(addresses) {
/!*    const encodedAddresses = addresses.map(addr =>
        toQualifiedAddress(this.ourUuid, addr)
    );
    return window.textsecure.storage.protocol.loadSessions(encodedAddresses, {
        zone: this.zone,
    });*!/
        console.log("uh oh")
        return null;
    }

    get(key, defaultValue) {
        if (key === null || key === undefined)
            throw new Error("Tried to get value for undefined/null key");
        if (key in this.store) {
            return this.store[key];
        } else {
            return defaultValue;
        }
    }
    put(key, value) {
        if (key === undefined || value === undefined || key === null || value === null)
            throw new Error("Tried to store undefined/null");
        this.store[key] = value;
    }
}

class IdentityKeyStoreImpl extends IdentityKeyStore {

    store = {};

    constructor(identityKeyPair, registrationId) {
        super();

        this.identityKeyPair = identityKeyPair;
        this.registrationId = registrationId;
    }

    async getIdentityKey() {
        return this.identityKeyPair.privateKey;
    }

    async getLocalRegistrationId() {
        return this.registrationId;
    }

    async getIdentity(address) {
        if (address === null || address === undefined)
            throw new Error("Tried to get identity key for undefined/null address");
        return Promise.resolve(this.get('identityKey' + address));
    }

    async saveIdentity(address, key) {
        if (address === null || address === undefined)
            throw new Error("Tried to put identity key for undefined/null key");

        const existing = this.get('identityKey' + address.name);
        this.put('identityKey' + address.name, key)

        if (existing && key.toString() !== existing.toString()) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    async isTrustedIdentity(address, key, direction) {
        if (address === null || address === undefined) {
            throw new Error("tried to check identity key for undefined/null key");
        }
        const trusted = this.get('identityKey' + address);
        if (trusted === undefined) {
            return Promise.resolve(true);
        }
        return Promise.resolve(key.toString() === trusted.toString());
    }

    put(key, value) {
        if (key === undefined || value === undefined || key === null || value === null)
            throw new Error("Tried to store undefined/null");
        this.store[key] = value;
    }

    get(key, defaultValue) {
        if (key === null || key === undefined)
            throw new Error("Tried to get value for undefined/null key");
        if (key in this.store) {
            return this.store[key];
        } else {
            return defaultValue;
        }
    }
}*/

module.exports = {
    Session
};