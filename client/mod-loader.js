'use strict';

const { app, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const os = require('os');

const GAME_DIR = path.dirname(app.getPath('exe'));
const MODS_DIR = path.join(GAME_DIR, 'mods');
const CACHE_DIR = path.join(MODS_DIR, '.cache');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetchURL(url, format = 'text') {
	return new Promise((resolve, reject) => {
		const lib = url.startsWith('https') ? https : http;
		const userAgent = `TankiOnline-ModLoader/1.0 (${os.platform()}; ${os.release()}; ${os.arch()}) Electron/${process.versions.electron}`;
		lib.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
			if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				return fetchURL(res.headers.location, format).then(resolve).catch(reject);
			}
			if (res.statusCode !== 200) {
				return reject(new Error(`HTTP ${res.statusCode} — ${url}`));
			}
			const chunks = [];
			res.on('data', chunk => chunks.push(chunk));
			res.on('end', () => {
				const buf = Buffer.concat(chunks);
				resolve(format === 'base64' ? buf.toString('base64') : buf.toString('utf8'));
			});
			res.on('error', reject);
		}).on('error', reject);
	});
}

function splitKey(rawKey) {
	const idx = rawKey.indexOf(':');
	return idx === -1 ? ['default', rawKey] : [rawKey.slice(0, idx), rawKey.slice(idx + 1)];
}

function readStore(modId) {
	try {
		return JSON.parse(fs.readFileSync(path.join(CACHE_DIR, modId, 'store.json'), 'utf8'));
	} catch {
		return {};
	}
}

function writeStore(modId, store) {
	ensureDir(path.join(CACHE_DIR, modId));
	fs.writeFileSync(path.join(CACHE_DIR, modId, 'store.json'), JSON.stringify(store, null, 2));
}

function setupIPC() {
	ipcMain.handle('mod:fetch', async (event, url) => {
		try {
			const isBinary = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)(\?|$)/i.test(url);
			const data = await fetchURL(url, isBinary ? 'base64' : 'text');
			return { data };
		} catch (e) {
			return { error: e.message };
		}
	});

	ipcMain.handle('mod:store:get', (event, rawKey, defaultValue) => {
		const [modId, key] = splitKey(rawKey);
		const store = readStore(modId);
		return key in store ? store[key] : defaultValue;
	});

	ipcMain.handle('mod:store:set', (event, rawKey, value) => {
		const [modId, key] = splitKey(rawKey);
		const store = readStore(modId);
		store[key] = value;
		writeStore(modId, store);
	});

	ipcMain.handle('mod:open-external', (event, url) => {
		shell.openExternal(url);
	});

	ipcMain.handle('mod:update-mod', async (event, url, filename) => {
		try {
			const content = await fetchURL(url, 'text');
			ensureDir(MODS_DIR);
			fs.writeFileSync(path.join(MODS_DIR, filename), content, 'utf8');
			return { success: true };
		} catch (e) {
			return { error: e.message };
		}
	});
}

function attachMods(win) {
	ensureDir(MODS_DIR);
	ensureDir(CACHE_DIR);

	const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.client.js'));

	if (files.length === 0) {
		console.log('[ModLoader] No mods found in', MODS_DIR);
		return;
	}

	console.log(`[ModLoader] Found ${files.length} mod(s):`, files);

	win.webContents.on('did-finish-load', () => {
		for (const file of files) {
			try {
				const source = fs.readFileSync(path.join(MODS_DIR, file), 'utf8');
				win.webContents.executeJavaScript(source)
					.then(() => console.log(`[ModLoader] ✓ ${file}`))
					.catch(e => console.error(`[ModLoader] ✗ ${file}:`, e.message));
			} catch (e) {
				console.error(`[ModLoader] ✗ Cannot read ${file}:`, e.message);
			}
		}
	});
}

setupIPC();

module.exports = { attachMods };