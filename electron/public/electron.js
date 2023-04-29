const path = require('path');

const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const generateKeys = require('./GenerateKeys');
const keyHelper = require('./KeyHelper');
const { ipcMain } = require('electron')
const Session = require("./Session");

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // and load the index.html of the app.
    // win.loadFile("index.html");
    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );
    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools({mode: 'detach'});
    }
}

ipcMain.on('generateKeysReq', (event, arg) => {
    event.returnValue = ('generateKeysRes', JSON.stringify(generateKeys.generateKeys(arg)));
})

ipcMain.on('deserialiseRemoteReq', (event, arg) => {
    event.returnValue = ('deserialiseRemoteRes', JSON.stringify(keyHelper.deserialiseRemoteUser(arg)));
})

ipcMain.on('deserialiseLocalReq', (event, arg) => {
    event.returnValue = ('deserialiseLocalRes', JSON.stringify(keyHelper.deserialiseLocalUser(arg)));
})

ipcMain.on('sendMessageReq', async (event, arg) => {
    const remoteUser = keyHelper.deserialiseRemoteUser(JSON.parse(arg.remoteUser));
    const localUser = keyHelper.deserialiseLocalUser(arg.localUser);
    const session = new Session.Session(localUser, remoteUser);
    const encrypted = await session.encrypt(arg.message);
    console.log(encrypted);
    event.returnValue = ('sendMessageRes', JSON.stringify(encrypted));
})

ipcMain.on('receiveMessageReq',async (event, arg) => {
    const remoteUser = keyHelper.deserialiseRemoteUser(JSON.parse(arg.remoteUser));
    const localUser = keyHelper.deserialiseLocalUser(arg.localUser);
    const session = new Session.Session(localUser, remoteUser);
    const decrypted = await session.decrypt(Buffer.from(arg.message));
    console.log(decrypted.toString());
    event.returnValue = ('receiveMessageRes', JSON.stringify(decrypted.toString()));
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});