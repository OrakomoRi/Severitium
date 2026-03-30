export default class PrivacyController {
	init() {
		document.querySelectorAll('[data-action="open-privacy"]').forEach(el => {
			el.addEventListener('click', e => {
				e.preventDefault();
				this.open();
			});
		});

		const modal = document.querySelector('[data-modal="privacy"]');
		if (!modal) return;

		modal.querySelector('[data-modal-action="close"]')?.addEventListener('click', () => this.close());

		modal.addEventListener('click', e => {
			if (e.target === modal) this.close();
		});

		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') this.close();
		});
	}

	open() {
		const modal = document.querySelector('[data-modal="privacy"]');
		if (!modal) return;
		modal.classList.add('open');
		document.body.style.overflow = 'hidden';
	}

	close() {
		const modal = document.querySelector('[data-modal="privacy"]');
		if (!modal) return;
		modal.classList.remove('open');
		document.body.style.overflow = '';
	}
}
