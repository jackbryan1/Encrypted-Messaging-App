const fs = require("fs");
const path = require("path");

function getPath(username, type) {
    const appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    return appdata + "\\electron\\" + username + "\\" + type + ".json";
}

function writeToFile(path, content) {

    ensureDirectoryExistence(path);
    fs.writeFile(path, JSON.stringify(content), 'utf8', (err) => {
        if (err) throw err;
    });
}

function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function readFromFile(path) {
    let retVal;
    try {
        retVal = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (err) {
        retVal = null;
    }
    return retVal;
}

function readUser(username) {

    const path = getPath(username, "user")

    return readFromFile(path);
}

function writeUser(username, identityKeyPair, registrationId, preKeys, signedPreKey) {

    const path = getPath(username, "user");

    writeToFile(path, {
        name: username,
        identityKeyPair: identityKeyPair,
        registrationId: registrationId,
        preKeys: preKeys,
        signedPreKey: signedPreKey
    });
}

function readMessages(username) {

    const path = getPath(username, 'messages')

    const messageObject = readFromFile(path);

    const retVal = messageObject ? changeFromArray(messageObject) : new Map()
    return retVal;
}

function writeMessages(username, messages) {

    const path = getPath(username, 'messages');

    const existingMessages = readMessages(username);
    const existingMessageArr = changeToArray(existingMessages);
    const newMessageArr = changeToArray(messages);
    const allMessages = existingMessageArr.concat(newMessageArr);
    writeToFile(path, allMessages);
}

function changeToArray(messages) {
    const arr = [];
    for(const value of messages.values()) {
        for (const item of value) {
            arr.push(item);
        }
    }
    return arr;
}

function changeFromArray(messages) {
    console.log(messages);
    const map = new Map();
    messages.forEach(function(item) {
        console.log(item);
        if (!map.has(item.other)) {
            map.set(item.other, []);
        }
        const msgs = map.get(item.other);
        msgs.push(item);
    })
    console.log(map);
    return map;
}

function readStore(username, type) {

    const path = getPath(username, type)

    let storeObject = readFromFile(path);

    let retVal;
    if(storeObject) {
        retVal = new Map(Object.entries(storeObject));
        retVal.forEach((value, key) => {
            retVal.set(key, Buffer.from(value));
        });
    } else {
        retVal = new Map();
    }
    return retVal;
}

function writeStore(username, type, store) {
    const storeObject = Object.fromEntries(store);

    const path = getPath(username, type);

    writeToFile(path, storeObject);
}

module.exports = {
    readUser,
    writeUser,
    readMessages,
    writeMessages,
    readStore,
    writeStore
};