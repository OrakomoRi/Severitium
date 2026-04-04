(function () {
	const getResourceID = path => {
		const parts = path.replace(/^\/|\/$/g, '').split('/');
		if (parts.length !== 4)
			console.error(`Invalid path format "${path}": expected 4 parts (without version)`);
		const high = parseInt(parts[0], 8);
		const part1 = parseInt(parts[1], 8);
		const part2 = parseInt(parts[2], 8);
		const part3 = parseInt(parts[3], 8);
		const low = ((part1 << 16) | (part2 << 8) | part3) >>> 0;
		return ((BigInt(high) << 32n) | BigInt(low)).toString();
	};

	const STAR_ICON_IDS = new Set([
		getResourceID('556/42713/122/201')
	]);

	const STAR_ICON_FILE = 'image.webp';

	const matchBackgroundUrl = url => {
		const [, path, file] = url.match(/(\d+\/\d+\/\d+\/\d+)\/[^\/]+\/([^\/]+)$/) || [];
		if (!path || !file) return false;
		const id = getResourceID(path);
		return STAR_ICON_IDS.has(id) && file === STAR_ICON_FILE;
	};

	const processElement = el => {
		const bg = getComputedStyle(el).backgroundImage;
		const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
		if (!urlMatch) return;
		if (matchBackgroundUrl(urlMatch[1])) {
			el.classList.add('BackgroundImageComponentStyle-starIcon');
		}
	};

	const observer = new MutationObserver(mutations => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof Element)) continue;
				if (node.classList.contains('-backgroundImageContain'))
					processElement(node);
				node.querySelectorAll('.-backgroundImageContain')
					.forEach(processElement);
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	document.querySelectorAll('.-backgroundImageContain').forEach(processElement);
})();