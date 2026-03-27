const geoCache = new Map();
let geoRemaining = 45;
let geoResetMs = 0;

/**
 * Pauses execution for a given number of milliseconds.
 *
 * @param {number} ms - Duration to sleep in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Resolves a two-letter country code for a given IP address.
 * Uses ip-api.com's free JSON endpoint (limit: 45 req/min per IP).
 *
 * Results are cached in memory for the lifetime of the process.
 * Rate limit state is tracked via X-Rl and X-Ttl response headers —
 * if the limit is exhausted, the function waits until the window resets
 * before making the next request.
 *
 * @param {string} ip - IPv4 or IPv6 address to look up
 * @returns {Promise<string|null>} Two-letter ISO 3166-1 alpha-2 country code, or null on failure
 */
export async function getCountry(ip) {
	if (geoCache.has(ip)) return geoCache.get(ip);

	if (geoRemaining <= 0) {
		const waitMs = geoResetMs - Date.now() + 100;
		if (waitMs > 0) await sleep(waitMs);
	}

	try {
		const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`);

		const rl  = parseInt(res.headers.get('X-Rl')  ?? '45');
		const ttl = parseInt(res.headers.get('X-Ttl') ?? '60');

		geoRemaining = rl;
		geoResetMs   = Date.now() + ttl * 1000;

		const { status, countryCode } = await res.json();
		const country = status === 'success' ? (countryCode || null) : null;

		geoCache.set(ip, country);
		return country;
	} catch {
		geoCache.set(ip, null);
		return null;
	}
}
