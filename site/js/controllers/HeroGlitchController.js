import '../../libs/glitchium.min.js';

export default class HeroGlitchController {
	init() {
		const el = document.querySelector('.hero-title');
		if (!el || typeof window.Glitchium === 'undefined') return;

		new window.Glitchium().glitch(el, {
			playMode: 'always',
			intensity: 0.1,
			fps: 30,
			layers: 5,
			shake: true,
			shakeIntensity: 0.05,
			filters: true,
			glitchFrequency: 2,
			glitchTimeSpan: { start: 0.1, end: 0.4 },
			slice: { minHeight: 0.01, maxHeight: 0.05, hueRotate: true },
		});
	}
}
