import express from 'express';
import { supabase } from './db.js';
import { getCountry } from './geo.js';

export const trackRouter = express.Router();

const queue = [];
let processing = false;

async function processQueue() {
	if (processing) return;
	processing = true;

	while (queue.length > 0) {
		const { cid, ip, userAgent, version, language } = queue.shift();

		try {
			const country = await getCountry(ip);

			const { data: userId, error } = await supabase
				.rpc('upsert_user', { p_fingerprint: cid });

			if (error) throw error;

			await supabase.from('events').insert({
				user_id:    userId,
				ip,
				user_agent: userAgent,
				language:   language || null,
				version:    version  || null,
				country,
			});
		} catch (e) {
			console.error('[Track] Failed to process event:', e.message);
		}
	}

	processing = false;
}

trackRouter.get('/', (req, res) => {
	res.status(200).end();

	const { cid, v, l } = req.query;
	if (!cid) return;

	const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

	queue.push({
		cid,
		ip,
		userAgent: req.headers['user-agent'] || null,
		version:   v || null,
		language:  l || null,
	});

	processQueue();
});
