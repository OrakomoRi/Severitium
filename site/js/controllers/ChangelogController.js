export default class ChangelogController {
	constructor(changelogService) {
		this._service = changelogService;
		this._loaded = false;
	}

	init() {
		document.querySelectorAll('[data-action="open-changelog"]').forEach(el => {
			el.addEventListener('click', e => {
				e.preventDefault();
				this.open();
			});
		});

		const modal = document.querySelector('[data-modal="changelog"]');
		if (!modal) return;

		modal.querySelector('[data-modal-action="close"]')?.addEventListener('click', () => this.close());

		modal.addEventListener('click', e => {
			if (e.target === modal) this.close();
		});

		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') this.close();
		});
	}

	async open() {
		const modal = document.querySelector('[data-modal="changelog"]');
		if (!modal) return;
		modal.classList.add('open');
		document.body.style.overflow = 'hidden';
		if (!this._loaded) await this._load();
	}

	close() {
		const modal = document.querySelector('[data-modal="changelog"]');
		if (!modal) return;
		modal.classList.remove('open');
		document.body.style.overflow = '';
	}

	async _load() {
		const body = document.querySelector('[data-modal="changelog"] [data-modal-field="body"]');
		if (!body) return;
		try {
			const html = await this._service.fetch();
			body.innerHTML = html;
			this._loaded = true;
		} catch {
			body.innerHTML = '<div class="cl-loading" style="color:var(--accent)">Failed to load changelog. Check the GitHub repository.</div>';
		}
	}
}
