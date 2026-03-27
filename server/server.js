import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { KeepAlive } from './keepAlive.js';
import { trackRouter } from './track.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Track user endpoint
 */
app.use('/api/track', trackRouter);

/**
 * Health check endpoint.
 *
 * @returns {object} Health status and uptime
 */
app.get('/api/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		uptime: Math.floor(process.uptime()),
	});
});

/**
 * Static file serving for /versions/* with 24h cache.
 * Handles semver paths with '+' in directory names.
 */
app.get('/versions/*path', (req, res) => {
	const relativePath = req.params.path;
	const filePath = path.join(ROOT_DIR, 'versions', relativePath);

	// Prevent path traversal
	if (!filePath.startsWith(path.join(ROOT_DIR, 'versions'))) {
		return res.status(403).end();
	}

	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		return res.status(404).end();
	}

	res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, must-revalidate`);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.sendFile(filePath);
});

/**
 * Serve root-level static files (stable.json, versions.json, loader.min.js).
 */
app.get('/:file', (req, res) => {
	const allowed = ['stable.json', 'versions.json', 'loader.min.js'];
	const { file } = req.params;

	if (!allowed.includes(file)) {
		return res.status(404).end();
	}

	const filePath = path.join(ROOT_DIR, file);

	if (!fs.existsSync(filePath)) {
		return res.status(404).end();
	}

	res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.sendFile(filePath);
});

/**
 * Handles graceful shutdown.
 *
 * @param {string} signal - Signal name (SIGTERM/SIGINT)
 */
function gracefulShutdown(signal) {
	console.log(`[Server] ${signal} received, shutting down...`);
	keepAlive.stop();
	process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const keepAlive = new KeepAlive(PORT);

app.listen(PORT, () => {
	console.log(`[Server] Running on port ${PORT}`);
	keepAlive.start();
});
