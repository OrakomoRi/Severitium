(function () {
	const ICONS = {
		'STAR': {
			id: '556/42713/122/201',
			file: 'image.webp',
			className: 'BackgroundImageComponentStyle-starIcon'
		},
		'XP': {
			id: '633/135565/247/307',
			file: 'image.svg',
			className: 'BackgroundImageComponentStyle-xpIcon'
		}
	};

	const getResourceID = path => {
		const parts = path.replace(/^\/|\/$/g, '').split('/');
		if (parts.length !== 4)
			return null;
		const high = parseInt(parts[0], 8);
		const part1 = parseInt(parts[1], 8);
		const part2 = parseInt(parts[2], 8);
		const part3 = parseInt(parts[3], 8);
		const low = ((part1 << 16) | (part2 << 8) | part3) >>> 0;
		return ((BigInt(high) << 32n) | BigInt(low)).toString();
	};

	const matchBackgroundUrl = url => {
		const [, path, file] = url.match(/(\d+\/\d+\/\d+\/\d+)\/[^\/]+\/([^\/]+)$/) || [];
		if (!path || !file) return false;
		const id = getResourceID(path);
		return Object.values(ICONS).some(icon => getResourceID(icon.id) === id && icon.file === file);
	};

	const processElement = el => {
		const bg = getComputedStyle(el).backgroundImage;
		const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
		if (!urlMatch) return;
		const icon = Object.values(ICONS).find(icon => matchBackgroundUrl(urlMatch[1]));
		if (icon) {
			el.classList.add(icon.className);
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