export default class ScrollController {
	init() {
		document.addEventListener('click', e => {
			const trigger = e.target.closest('[data-block]');
			if (!trigger) return;
			e.preventDefault();
			const target = document.querySelector(`[data-section="${trigger.dataset.block}"]`);
			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	}
}
