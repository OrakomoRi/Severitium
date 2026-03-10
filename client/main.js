"use strict";

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs')
const parseArgs = require('minimist');
const { attachMods } = require('./mod-loader.js');

process.on('unhandledRejection', (reason, promise) => {
	throw reason;
});
process.on('uncaughtException', (error) => {
	console.error(error, error.stack);
});

const argv = parseArgs(process.argv.slice(1));
let config = require(getConfigPath())
console.log("args", argv)
console.log("config", config);

if (typeof config['vsync'] === "undefined") {
	config['vsync'] = true
}

app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('force_high_performance_gpu');
if (process.arch == 'ia32') {
	app.commandLine.appendSwitch('js-flags', '--max-old-space-size=3072');
}
if (!config['vsync']) {
	app.commandLine.appendSwitch('disable-frame-rate-limit')
}

const Sentry = require('@sentry/electron/main');
Sentry.init({
	dsn: 'https://545f56153bef475fbca3adb9e198ae08@sentry.tankionline.com/32',
	release: config['sentryRelease'],
	environment: config['sentryEnvironment'],
});

const log = require('electron-log');
log.transports.file.level = 'info';
log.info('tankionline starting. version: ' + config['sentryRelease'] + ' environment: ' + config['sentryEnvironment']);

const { autoUpdater } = require("electron-updater");
autoUpdater.logger = log;

let release
if (isSteam()) {
	release = require('./content/scripts/steam.js')
} else {
	release = require('./content/scripts/standalone.js')
}

const restart = () => {
	app.relaunch();
	app.exit();
};
const startGame = () => {
	if (config['checkForUpdates'] && !isSteam()) {
		log.debug('checkForUpdates');
		autoUpdater
			.checkForUpdatesAndNotify()
			.catch((error) => {
				Sentry.captureException(error);
				log.error(error);
			});
	}
	Menu.setApplicationMenu(null);
	const win = release.createGameWindow(config['loadURL'], config['DEV'], config['vsync']);
	attachMods(win);

	ipcMain.on('restart', (event) => {
		restart()
	})
	ipcMain.on('vsync-changed', (event, vsyncEnabled) => {
		config['vsync'] = vsyncEnabled;
		writeConfig(config)
	})
};

app.on('ready', startGame);
app.on('window-all-closed', () => {
	app.quit()
})

function writeConfig(config) {
	fs.writeFileSync(getConfigPath(), JSON.stringify(config));
}

function getConfigPath() {
	if (typeof argv['config'] === "undefined") {
		return path.join(process.resourcesPath, 'tankionline.json')
	} else {
		return path.join(__dirname, argv['config'])
	}
}

function isSteam() {
	return config['distribution'] === 'steam'
}
