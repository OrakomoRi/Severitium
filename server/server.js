import express from 'express';
import { KeepAlive } from './keepAlive.js';
import { trackRouter } from './track.js';
import { nicknameRouter } from './nickname.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/track', trackRouter);
app.use('/api/nickname', nicknameRouter);

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
