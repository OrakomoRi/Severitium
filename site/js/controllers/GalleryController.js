import ImageComparisonSlider from '../components/ImageComparisonSlider.js';

export default class GalleryController {
	constructor(galleryService, i18nService) {
		this._gallery = galleryService;
		this._i18n = i18nService;
		this._currentView = 'severitium';
		this._currentCategory = 'all';
		this._activeItems = [];
		this._slider = null;
		this._currentIndex = 0;
		this._page = 1;
	}

	_getItemsPerPage() {
		return window.innerWidth <= 768 ? 3 : 6;
	}

	async init() {
		await this._gallery.load();

		this._activeItems = this._gallery.items;
		this._renderItems(this._activeItems);
		this._setupToggleButtons();
		this._setupModalEvents();

		// Setup BreeziumSelect for category filter
		try {
			await this._setupBreeziumSelect(this._gallery.categories);
		} catch (err) {
			console.warn('BreeziumSelect not available for gallery filter:', err);
		}

		// Re-render select on language change
		document.addEventListener('languageChanged', () => {
			this._rebuildSelect();
		});

		// Re-render on window resize if items per page changes
		let currentItemsPerPage = this._getItemsPerPage();
		window.addEventListener('resize', () => {
			const newItemsPerPage = this._getItemsPerPage();
			if (newItemsPerPage !== currentItemsPerPage) {
				currentItemsPerPage = newItemsPerPage;
				this._page = 1;
				this._renderItems(this._activeItems);
			}
		});
	}

	_renderItems(items) {
		const grid = document.querySelector('[data-component="gallery-grid"]');
		if (!grid) return;

		const itemsPerPage = this._getItemsPerPage();
		const totalPages = Math.ceil(items.length / itemsPerPage);
		if (this._page > totalPages) this._page = Math.max(1, totalPages);

		const start = (this._page - 1) * itemsPerPage;
		const pageItems = items.slice(start, start + itemsPerPage);

		grid.innerHTML = '';
		pageItems.forEach((item, i) => {
			const globalIndex = start + i;
			const src = this._currentView === 'original' ? item.oldSrc : item.newSrc;
			const el = document.createElement('div');
			el.className = 'gallery-item';
			el.dataset.cat = item.category;
			el.innerHTML = `
				<img src="${src}" alt="${item.title}" loading="lazy">
				<div class="gallery-overlay"></div>
				<div class="gallery-label">
					<span class="gallery-name">${item.title}</span>
					<span class="gallery-cat">${item.category}</span>
				</div>
			`;
			el.addEventListener('click', () => {
				this._openModal(globalIndex, items);
			});
			grid.appendChild(el);
		});

		this._renderPagination(items.length, totalPages);
	}

	_renderPagination(_total, totalPages) {
		// Remove previous pagination
		document.querySelector('.gallery-pagination')?.remove();
		if (totalPages <= 1) return;

		const nav = document.createElement('div');
		nav.className = 'gallery-pagination';

		const prevBtn = document.createElement('button');
		prevBtn.className = 'gallery-pagination__btn';
		prevBtn.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>';
		prevBtn.disabled = this._page === 1;
		prevBtn.addEventListener('click', () => this._goToPage(this._page - 1));

		const nextBtn = document.createElement('button');
		nextBtn.className = 'gallery-pagination__btn';
		nextBtn.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon>';
		nextBtn.disabled = this._page === totalPages;
		nextBtn.addEventListener('click', () => this._goToPage(this._page + 1));

		nav.appendChild(prevBtn);

		// Smart pagination: show fewer pages on mobile
		const isMobile = window.innerWidth <= 768;
		const visibleRange = isMobile ? 1 : 2; // ±1 on mobile, ±2 on desktop
		const startPage = Math.max(1, this._page - visibleRange);
		const endPage = Math.min(totalPages, this._page + visibleRange);

		// Add first page and ellipsis if needed
		if (startPage > 1) {
			const firstBtn = document.createElement('button');
			firstBtn.className = 'gallery-pagination__btn';
			firstBtn.textContent = '1';
			firstBtn.addEventListener('click', () => this._goToPage(1));
			nav.appendChild(firstBtn);

			if (startPage > 2) {
				const ellipsis = document.createElement('span');
				ellipsis.className = 'gallery-pagination__ellipsis';
				ellipsis.textContent = '...';
				nav.appendChild(ellipsis);
			}
		}

		// Add visible page range
		for (let p = startPage; p <= endPage; p++) {
			const btn = document.createElement('button');
			btn.className = 'gallery-pagination__btn' + (p === this._page ? ' active' : '');
			btn.textContent = p;
			btn.addEventListener('click', () => this._goToPage(p));
			nav.appendChild(btn);
		}

		// Add ellipsis and last page if needed
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				const ellipsis = document.createElement('span');
				ellipsis.className = 'gallery-pagination__ellipsis';
				ellipsis.textContent = '...';
				nav.appendChild(ellipsis);
			}

			const lastBtn = document.createElement('button');
			lastBtn.className = 'gallery-pagination__btn';
			lastBtn.textContent = totalPages;
			lastBtn.addEventListener('click', () => this._goToPage(totalPages));
			nav.appendChild(lastBtn);
		}

		nav.appendChild(nextBtn);

		document.querySelector('[data-component="gallery-grid"]')?.after(nav);
	}

	_goToPage(page) {
		this._page = page;
		this._renderItems(this._activeItems);
		document.querySelector('[data-section="gallery"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	_setupToggleButtons() {
		document.querySelectorAll('.toggle-btn[data-view]').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.toggle-btn[data-view]').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				this._currentView = btn.dataset.view;
				this._activeItems = this._gallery.filter(this._currentCategory);
				this._page = 1;
				this._renderItems(this._activeItems);
			});
		});
	}

	_setupModalEvents() {
		const modal = document.querySelector('[data-modal="img"]');
		if (!modal) return;

		modal.querySelector('[data-modal-action="close"]')?.addEventListener('click', () => this._closeModal());
		modal.querySelector('[data-modal-nav="prev"]')?.addEventListener('click', () => this._navigate(-1));
		modal.querySelector('[data-modal-nav="next"]')?.addEventListener('click', () => this._navigate(1));

		modal.addEventListener('click', e => {
			if (e.target === modal) this._closeModal();
		});

		document.addEventListener('keydown', e => {
			if (!modal.classList.contains('open')) return;
			if (e.key === 'Escape') this._closeModal();
			if (e.key === 'ArrowLeft') this._navigate(-1);
			if (e.key === 'ArrowRight') this._navigate(1);
		});
	}

	_openModal(index, items) {
		const modal = document.querySelector('[data-modal="img"]');
		const content = modal?.querySelector('[data-modal-field="content"]');
		if (!modal || !content) return;

		// Destroy previous slider
		if (this._slider) {
			this._slider.destroy();
			this._slider = null;
		}

		this._currentIndex = index;

		const item = items[index];

		const titleEl = modal.querySelector('[data-modal-field="title"]');
		const catEl = modal.querySelector('[data-modal-field="cat"]');
		if (titleEl) titleEl.textContent = item.title;
		if (catEl) catEl.textContent = item.category;

		const newLabel = this._i18n.t('gallery.severitium') || 'Severitium';
		const oldLabel = this._i18n.t('gallery.original') || 'Original';
		const initialState = this._currentView === 'original' ? 'old' : 'new';

		const sliderContainer = document.createElement('div');
		content.innerHTML = '';
		content.appendChild(sliderContainer);

		this._slider = new ImageComparisonSlider(
			sliderContainer,
			item.oldSrc,
			item.newSrc,
			{ newLabel, oldLabel, initialState }
		);

		modal.classList.add('open');
		document.body.style.overflow = 'hidden';
	}

	_closeModal() {
		const modal = document.querySelector('[data-modal="img"]');
		if (!modal) return;
		if (this._slider) {
			this._slider.destroy();
			this._slider = null;
		}
		modal.classList.remove('open');
		document.body.style.overflow = '';
	}

	_navigate(dir) {
		const newIndex = this._currentIndex + dir;
		if (newIndex < 0 || newIndex >= this._activeItems.length) return;
		this._openModal(newIndex, this._activeItems);
	}

	async _setupBreeziumSelect(categories) {
		await this._waitForBreeziumSelect();
		this._categories = categories;
		this._buildSelect(categories);
	}

	_buildSelect(categories) {
		const container = document.querySelector('[data-component="gallery-filter"]');
		if (!container) return;

		const allLabel = this._i18n.t('gallery.all') || 'All';
		const options = [
			{ value: 'all', name: allLabel },
			...categories.map(cat => ({
				value: cat,
				name: this._i18n.t(`gallery.${cat}`) || cat
			}))
		];

		container.innerHTML = '';

		this._selectInstance = new window.BreeziumSelect(
			options,
			(value) => {
				this._currentCategory = value;
				this._activeItems = this._gallery.filter(value);
				this._page = 1;
				this._renderItems(this._activeItems);
			},
			this._currentCategory
		);

		this._selectInstance.render(container);
	}

	_rebuildSelect() {
		if (!this._categories) return;
		this._buildSelect(this._categories);
	}

	_waitForBreeziumSelect(maxAttempts = 20, interval = 100) {
		return new Promise((resolve, reject) => {
			if (window.BreeziumSelect) {
				resolve();
				return;
			}
			let attempts = 0;
			const timer = setInterval(() => {
				attempts++;
				if (window.BreeziumSelect) {
					clearInterval(timer);
					resolve();
				} else if (attempts >= maxAttempts) {
					clearInterval(timer);
					reject(new Error('BreeziumSelect not available'));
				}
			}, interval);
		});
	}
}
