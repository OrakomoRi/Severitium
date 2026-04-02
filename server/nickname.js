import express from 'express';
import { supabase } from './db.js';

/**
 * Express router handling the /api/nickname endpoint.
 * Responds immediately and processes nickname storage asynchronously via an in-memory queue.
 *
 * @type {import('express').Router}
 */
export const nicknameRouter = express.Router();

/**
 * In-memory queue of pending nickname events.
 *
 * @type {Array<{cid: string, nick: string}>}
 */
const queue = [];

/**
 * Whether the queue processor is currently running.
 *
 * @type {boolean}
 */
let processing = false;

/**
 * Drains the nickname queue one item at a time.
 * Calls the add_nickname DB function which adds the nickname only if not already present.
 *
 * @async
 * @returns {Promise<void>}
 */
async function processQueue() {
	if (processing) return;
	processing = true;

	while (queue.length > 0) {
		const { cid, nick } = queue.shift();

		try {
			const { error } = await supabase
				.rpc('add_nickname', { p_fingerprint: cid, p_nickname: nick });

			if (error) throw error;
		} catch (e) {
			console.error('[Nickname] Failed to process event:', e.message);
		}
	}

	processing = false;
}

/**
 * GET /api/nickname
 *
 * Accepts a nickname ping from the client extension.
 * Responds with 200 immediately, then enqueues the nickname for async processing.
 *
 * @query {string} cid  - Client fingerprint (required)
 * @query {string} nick - Player nickname observed in the game (required)
 *
 * @returns {void} Empty 200 response
 */
nicknameRouter.get('/', (req, res) => {
	res.status(200).end();

	const { cid, nick } = req.query;
	if (!cid || !nick) return;

	queue.push({ cid, nick });

	processQueue();
});
