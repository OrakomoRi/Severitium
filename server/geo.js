const geoCache = new Map();
let geoRemaining = 45;
let geoResetMs = 0;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
