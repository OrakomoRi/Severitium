import https from 'https';
import http from 'http';

/**
 * Keep-alive service for preventing Render free tier sleep.
 * Automatically pings the health endpoint at regular intervals.
 * 
 * @class KeepAlive
 */
export class KeepAlive {
	/**
	 * Creates a new KeepAlive instance.
	 * 
	 * @constructor
	 * @param {number} [port=3000] - HTTP server port
	 * @param {number} [interval=300000] - Ping interval in milliseconds
	 */
	constructor(port = 3000, interval = 5 * 60 * 1000) {
		this.port = port;
		this.url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
		this.interval = interval;
		this.timer = null;
		this.startTime = Date.now();
		this.isHttps = this.url.startsWith('https://');
		this.isPinging = false; // Prevent concurrent pings
	}

	/**
	 * Starts the keep-alive service.
	 * Only activates when RENDER_EXTERNAL_URL environment variable is set.
	 * 
	 * @returns {void}
	 */
	start() {
		if (!process.env.RENDER_EXTERNAL_URL) {
			console.log('[Keep-Alive] Disabled (local environment)');
			return;
		}

		console.log(`[Keep-Alive] Started: pinging ${this.url}/api/health every ${this.interval / 60000} minutes`);

		this.schedulePing(60000);
	}

	/**
	 * Schedules the next ping using recursive setTimeout.
	 * 
	 * @param {number} delay - Delay before next ping in milliseconds
	 * @returns {void}
	 */
	schedulePing(delay) {
		if (this.timer) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(async () => {
			await this.ping();
			if (this.timer !== null) {
				this.schedulePing(this.interval);
			}
		}, delay);
	}

	/**
	 * Stops the keep-alive service.
	 * 
	 * @returns {void}
	 */
	stop() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
			console.log('[Keep-Alive] Stopped');
		}
	}

	/**
	 * Pings the health endpoint.
	 * 
	 * @async
	 * @returns {Promise<void>}
	 */
	async ping() {
		if (this.isPinging) {
			return;
		}

		this.isPinging = true;

		try {
			await this._performPing();
		} finally {
			this.isPinging = false;
		}
	}

	/**
	 * Performs the actual HTTP ping request.
	 * 
	 * @returns {Promise<void>}
	 */
	_performPing() {
		return new Promise((resolve) => {
			const url = new URL(`${this.url}/api/health`);
			const client = this.isHttps ? https : http;
			
			const req = client.get(url, (res) => {
				const chunks = [];
				let totalLength = 0;

				res.on('data', (chunk) => {
					chunks.push(chunk);
					totalLength += chunk.length;

				});

				res.on('end', () => {
					if (res.statusCode === 200) {
						try {
							const data = Buffer.concat(chunks, totalLength).toString('utf8');
							const parsed = JSON.parse(data);
							console.log('[Keep-Alive] Ping successful:', {
								status: parsed.status,
								uptime: Math.floor(parsed.uptime || 0),
								timestamp: new Date().toISOString()
							});
						} catch (e) {
							console.log('[Keep-Alive] Ping successful (status 200)');
						}
					} else {
						console.warn(`[Keep-Alive] Ping failed: HTTP ${res.statusCode}`);
					}
					resolve();
				});

				res.on('error', () => {
					resolve();
				});
			});

			req.on('error', (error) => {
				console.error('[Keep-Alive] Error:', error.message);
				resolve();
			});

			req.setTimeout(10000, () => {
				req.destroy();
				console.error('[Keep-Alive] Timeout');
				resolve();
			});

			req.end();
		});
	}

	/**
	 * Gets service uptime in seconds.
	 * 
	 * @returns {number} Uptime in seconds
	 */
	getUptime() {
		return Math.floor((Date.now() - this.startTime) / 1000);
	}
}
