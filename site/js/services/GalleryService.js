import ImageItem from '../models/ImageItem.js';

export default class GalleryService {
	constructor(manifestPath = 'site/config/image-manifest.json') {
		this._manifestPath = manifestPath;
		this._items = [];
		this._categories = [];
	}

	async load() {
		const response = await fetch(this._manifestPath);
		if (!response.ok) throw new Error(`Failed to load manifest: ${response.status}`);
		const manifest = await response.json();

		const items = [];
		const categorySet = new Set();

		for (const [category, data] of Object.entries(manifest.categories)) {
			categorySet.add(category);
			if (data.matched && Array.isArray(data.matched)) {
				for (const entry of data.matched) {
					items.push(new ImageItem(entry.baseName, entry.new, entry.old, category));
				}
			}
		}

		// Sort by category then baseName
		items.sort((a, b) => {
			if (a.category < b.category) return -1;
			if (a.category > b.category) return 1;
			if (a.baseName < b.baseName) return -1;
			if (a.baseName > b.baseName) return 1;
			return 0;
		});

		this._items = items;
		this._categories = Array.from(categorySet).sort();
	}

	get items() {
		return this._items;
	}

	get categories() {
		return this._categories;
	}

	filter(category = 'all') {
		if (category === 'all') return this._items;
		return this._items.filter(item => item.category === category);
	}
}
