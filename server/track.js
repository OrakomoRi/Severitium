import express from 'express';
import { supabase } from './db.js';
import { getCountry } from './geo.js';

/**
 * Express router handling the /api/track endpoint.
 * Responds immediately and processes tracking asynchronously via an in-memory queue.
 *
 * @type {import('express').Router}
 */
export const trackRouter = express.Router();

/**
 * In-memory queue of pending tracking events.
 * Populated on each incoming request and drained by {@link processQueue}.
 *
 * @type {Array<{cid: string, ip: string, userAgent: string|null, version: string|null, language: string|null}>}
 */
const queue = [];

/**
 * Whether the queue processor is currently running.
 * Prevents concurrent processing of the same queue.
 *
 * @type {boolean}
 */
let processing = false;

/**
 * Drains the event queue one item at a time.
 * For each event: resolves the country via IP geolocation,
 * upserts the user by fingerprint, then inserts an event record.
 *
 * Safe to call multiple times — only one instance runs at a time.
 *
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * GET /api/track
 *
 * Accepts a tracking ping from the client extension.
 * Responds with 200 immediately, then enqueues the event for async processing.
 *
 * @query {string} cid - Client fingerprint (required)
 * @query {string} [v]  - Theme version currently in use
 * @query {string} [l]  - User language (BCP 47 tag, e.g. "en", "ru")
 *
 * @returns {void} Empty 200 response
 */
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
