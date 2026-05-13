import express from 'express';
import { supabase } from './db.js';

/**
 * Express router handling the /api/presence endpoint.
 * Responds immediately and processes presence updates asynchronously via an in-memory queue.
 *
 * @type {import('express').Router}
 */
export const presenceRouter = express.Router();

/**
 * In-memory queue of pending presence events.
 *
 * @type {Array<{cid: string}>}
 */
const queue = [];

/**
 * Whether the queue processor is currently running.
 *
 * @type {boolean}
 */
let processing = false;

/**
 * Drains the presence queue one item at a time.
 * Calls upsert_user to update last_seen without inserting an event record.
 *
 * @async
 * @returns {Promise<void>}
 */
async function processQueue() {
	if (processing) return;
	processing = true;

	while (queue.length > 0) {
		const { cid } = queue.shift();
		try {
			const { error } = await supabase.rpc('upsert_user', { p_fingerprint: cid });
			if (error) throw error;
		} catch (e) {
			console.error('[Presence] Failed:', e.message);
		}
	}

	processing = false;
}

/**
 * GET /api/presence
 *
 * Accepts a presence ping from the client extension on every game load.
 * Responds with 200 immediately, then enqueues the update for async processing.
 * Only updates last_seen in users — does not insert an event record.
 *
 * @query {string} cid - Client fingerprint (required)
 *
 * @returns {void} Empty 200 response
 */
presenceRouter.get('/', (req, res) => {
	res.status(200).end();

	const { cid } = req.query;
	if (!cid) return;

	queue.push({ cid });
	processQueue();
});
