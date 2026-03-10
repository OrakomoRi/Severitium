"use strict";

const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron');
const steamworks = require('steamworks.js')
const { SteamCallback } = steamworks
const path = require('path');
const isOnline = require('is-online');

const appId = 562010

function createGameWindow(loadURL, dev, vsync) {
    console.log(`createGameWindow steam dev=${dev} vsync=${vsync} url=${loadURL}`)

    const gameWindow = new BrowserWindow({
        width: 1024,
        height: 1024,
        show: true,
        fullscreenable: true,
        frame: true,
        toolbar: true,
        backgroundColor: '#001926',
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true,
            additionalArguments: [
                `x.config.vsync=${vsync}`,
            ],
        }
    });
    waitInternetBeforeLoadGame(gameWindow, loadURL, dev, vsync)

    return gameWindow
}

function waitInternetBeforeLoadGame(gameWindow, loadURL, dev, vsync) {
    console.log("Check internet connection");
    isOnline().then(online => {
        if (online) {
            console.log("Connected to internet");
            try {
                const steamClient = steamworks.init(appId);
                console.log("Connected to Steam");
                loadGame(gameWindow, steamClient, loadURL, dev, vsync)
            } catch (error) {
                console.log("Cannot connect to Steam");
                gameWindow.loadURL(`file://${__dirname}/../steam_not_running.html`);
                setTimeout(() => {
                    waitInternetBeforeLoadGame(gameWindow, loadURL, dev, vsync)
                }, 5000);
            }
        } else {
            gameWindow.loadURL(`file://${__dirname}/../index.html`)
            waitInternetBeforeLoadGame(gameWindow, loadURL, dev, vsync)
        }
    });
}

function loadGame(gameWindow, steamClient, loadURL, dev, vsync) {
    const steamId64 = steamClient.localplayer.getSteamId().steamId64
    steamClient.auth.getSessionTicketWithSteamId(steamId64).then((ticket) => {
        const authSessionTicket = ticket.getBytes().toString('hex')
        const url = loadURL +
            '&client=electron' +
            '&partnerId=steam' +
            '&userId=' + steamId64 +
            '&authSessionTicket=' + authSessionTicket
        gameWindow.loadURL(url)
        if (steamClient.utils.isSteamRunningOnSteamDeck()) {
            gameWindow.setFullScreen(true)
        } else {
            gameWindow.maximize()
        }
        if (dev) {
            gameWindow.webContents.openDevTools();
        }
        gameWindow.on('enter-html-full-screen', () => {
            gameWindow.setFullScreen(true);
        });
        gameWindow.on('leave-html-full-screen', () => {
            gameWindow.setFullScreen(false);
        });
        app.on('browser-window-focus', () => {
            globalShortcut.register('CommandOrControl+R', () => {
                gameWindow.reload()
            })
            globalShortcut.register('CommandOrControl+Shift+I', () => {
                if (gameWindow.webContents.isDevToolsOpened()) {
                    gameWindow.webContents.closeDevTools()
                } else {
                    gameWindow.webContents.openDevTools()
                }
            })
        })
        app.on('browser-window-blur', () => {
            globalShortcut.unregisterAll()
        })
        steamClient.callback.register(SteamCallback.MicroTxnAuthorizationResponse, (appId, orderId, authorized) => {
            gameWindow.webContents.send('steamPayment', { 'appId': appId, 'orderId': orderId, 'authorized': authorized });
        });
    }).catch((error) => {
        console.error(error);
        gameWindow.loadURL(`file://${__dirname}/../index.html`)
        loadGame(gameWindow, steamClient, loadURL, dev, vsync)
    });;
}

module.exports = {
    createGameWindow,
};

steamworks.electronEnableSteamOverlay();
