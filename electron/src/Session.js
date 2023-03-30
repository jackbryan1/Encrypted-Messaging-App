import {IdentityKeyStore, PublicKey, SessionStore, signalEncrypt, ProtocolAddress} from "@signalapp/libsignal-client";
import App from "./App";

class Session {
    constructor(localUser, remoteUser) {
        this.localUser = localUser;
        this.remoteUser = remoteUser
    }

    encrypt(message) {
        const encrypted = signalEncrypt(Buffer.from(message), new ProtocolAddress(this.remoteUser.name, this.remoteUser.deviceId), new SessionStoreImpl(), new IdentityKeyStoreImpl(this.localUser.identityKeyPair, this.localUser.remoteUser));
        console.log(encrypted);
    }

    decrypt() {

    }
}

export class SessionStoreImpl extends SessionStore {

    store = {};
    constructor( ) {
        super();
    }

    async saveSession(address, record) {
        return Promise.resolve(this.put('session' + address, record));
    }

    async getSession(address) {
        return Promise.resolve(this.get('session' + address));
    }

    async getExistingSessions(addresses) {
/*    const encodedAddresses = addresses.map(addr =>
        toQualifiedAddress(this.ourUuid, addr)
    );
    return window.textsecure.storage.protocol.loadSessions(encodedAddresses, {
        zone: this.zone,
    });*/
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
    remove(key) {
        if (key === null || key === undefined)
            throw new Error("Tried to remove value for undefined/null key");
        delete this.store[key];
    }
}

export class IdentityKeyStoreImpl extends IdentityKeyStore {

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
}

export default Session;