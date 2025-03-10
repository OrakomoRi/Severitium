(function () {
	// An object named SVGs, where keys are link parts and values are SVG strings
	var SVGs = {
		'tanki_online': `<svg class="item-icon" width="256" height="248" viewBox="0 0 256 248" xmlns="http://www.w3.org/2000/svg"><path d="M189.387 37.2267L151.677 112.647L141.438 106.248L163.434 18.2646L189.387 37.2267Z"/><path d="M152.48 127.3C153.465 127.915 154.368 128.628 155.18 129.422C156.418 130.631 157.445 132.027 158.228 133.55C159.248 135.533 159.856 137.732 159.977 140.014C159.992 140.298 160 140.582 160 140.868V148.133C159.988 149.908 158.117 151.058 156.527 150.262L112.001 128.001L111.999 115.999C111.999 113.822 113.738 112.052 115.902 112H123.411C126.41 112 129.348 112.843 131.891 114.432L152.48 127.3Z"/><path d="M81.3518 112.676L93.3088 104.704C97.9085 101.637 103.313 100 108.842 100H123.411C126.985 100 130.51 100.684 133.8 101.999L143.594 4.06108C132.782 -1.98301 119.317 -1.28056 109.122 6.16845L13.2415 76.2222C1.98472 84.4468 -2.72557 99.0252 1.57413 112.333L38.1972 225.682C42.4969 238.99 54.8286 248 68.7427 248H187.257C201.171 248 213.503 238.99 217.803 225.682L246.611 136.522L184 140L254.323 112.652L254.426 112.333C257.621 102.444 255.841 91.8535 250.096 83.6898L170.922 133.173C171.629 135.644 172 138.231 172 140.868V148H175.072C177.514 148 179.923 148.559 182.115 149.633L201.476 159.124C213.977 165.252 220.077 179.633 215.794 192.88L207.224 219.384C204.022 229.289 194.798 236 184.388 236H162.898C159.541 236 156.21 235.396 153.066 234.217L125.824 224H114.486C109.366 231.351 100.874 236 91.505 236H68.7034C60.0255 236 52.3377 230.404 49.6711 222.146L34.4584 175.035C31.9859 167.378 35.5842 159.076 42.8625 155.646L67.9999 143.797V128L18.3238 105.073C16.9072 104.419 16 103.001 16 101.441V90.4721C16 88.957 16.856 87.572 18.2111 86.8944L22.2111 84.8944C23.3373 84.3314 24.6627 84.3314 25.7889 84.8944L81.3518 112.676Z"/><path d="M80 144L80.0022 147.147C80.0026 147.762 80.3548 148.322 80.9085 148.588L82.7203 149.46C85.8637 150.972 87.6647 154.347 87.1714 157.8L80.7543 202.72C80.2647 206.147 78.6766 209.323 76.2284 211.771L66.0476 221.951C65.5925 222.407 65.6054 223.056 65.921 223.501C66.794 223.825 67.7332 224 68.7034 224H91.505C93.8921 224 96.1797 223.472 98.2412 222.514C102.52 220.526 105.825 216.688 107.027 211.881L116.642 173.431C118.512 165.705 114.424 157.769 107.033 154.812L80 144Z"/><path d="M168.064 224H184.388C189.593 224 194.205 220.644 195.806 215.692L204.376 189.188C206.823 181.619 203.338 173.401 196.194 169.899L176.833 160.408C176.566 160.278 176.287 160.177 176 160.109V163.01C176 163.616 176.342 164.17 176.884 164.441L177.794 164.896C181.355 166.677 183.065 170.804 181.806 174.581L168.597 214.207C168.204 215.386 167.543 216.456 166.665 217.334L162.049 221.951C161.293 222.706 161.828 223.999 162.897 223.999H168L168.064 224Z"/><path d="M163.158 120.447C164.781 121.97 166.207 123.672 167.414 125.513L232.398 68.6521L218.333 58.3758L163.158 120.447Z"/><path d="M128 160L160.732 173.093C164.772 174.708 166.779 179.256 165.252 183.329L157.947 202.809C156.776 205.931 153.791 208 150.456 208H120L128 176C129.314 170.747 129.314 165.252 128 160Z"/></svg>`,
		'vk': `<svg class="item-icon" width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_14426_51602)"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.37413 3.37413C0 6.74826 0 12.1788 0 23.04V24.96C0 35.8212 0 41.2517 3.37413 44.6259C6.74826 48 12.1788 48 23.04 48H24.96C35.8212 48 41.2517 48 44.6259 44.6259C48 41.2517 48 35.8212 48 24.96V23.04C48 12.1788 48 6.74826 44.6259 3.37413C41.2517 0 35.8212 0 24.96 0H23.04C12.1788 0 6.74826 0 3.37413 3.37413ZM8.10059 14.5996C8.36059 27.0796 14.6005 34.5796 25.5405 34.5796H26.1607V27.4396C30.1807 27.8396 33.2204 30.7796 34.4404 34.5796H40.1206C38.5606 28.8996 34.4604 25.7596 31.9004 24.5596C34.4604 23.0796 38.0604 19.4796 38.9204 14.5996H33.7603C32.6403 18.5596 29.3207 22.1596 26.1607 22.4996V14.5996H21.0005V28.4396C17.8005 27.6396 13.7606 23.7596 13.5806 14.5996H8.10059Z"/></g><defs><clipPath id="clip0_14426_51602"><rect width="48" height="48"/></clipPath></defs></svg>`,
		'google': `<svg class="item-icon" width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_11467_48483)"><path d="M47.4898 24.54C47.4898 22.96 47.3498 21.46 47.1098 20H24.5098V29.02H37.4498C36.8698 31.98 35.1698 34.48 32.6498 36.18V42.18H40.3698C44.8898 38 47.4898 31.84 47.4898 24.54Z"/><path d="M24.5098 48.0001C30.9898 48.0001 36.4098 45.8401 40.3698 42.1801L32.6498 36.1801C30.4898 37.6201 27.7498 38.5001 24.5098 38.5001C18.2498 38.5001 12.9498 34.2801 11.0498 28.5801H3.08984V34.7601C7.02984 42.6001 15.1298 48.0001 24.5098 48.0001Z"/><path d="M11.0498 28.5802C10.5498 27.1402 10.2898 25.6002 10.2898 24.0002C10.2898 22.4002 10.5698 20.8602 11.0498 19.4202V13.2402H3.08976C1.44976 16.4802 0.509766 20.1202 0.509766 24.0002C0.509766 27.8802 1.44976 31.5202 3.08976 34.7602L11.0498 28.5802Z"/><path d="M24.5098 9.5C28.0498 9.5 31.2098 10.72 33.7098 13.1L40.5498 6.26C36.4098 2.38 30.9898 0 24.5098 0C15.1298 0 7.02984 5.40001 3.08984 13.24L11.0498 19.42C12.9498 13.72 18.2498 9.5 24.5098 9.5Z"/></g><defs><clipPath id="clip0_11467_48483"><rect width="48" height="48"/></clipPath></defs></svg>`,
		'create_account': `<svg class="item-icon" width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 0H28.5V19.5H48V28.5L0 28.5V19.5H19.5V0Z"/><path d="M19.5003 37.5001L28.5003 28.5001V48.0001L19.5003 48.0001V37.5001Z"/></svg>`,
		'authorization': `<svg class="item-icon" width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V21H30L15 6H24L42 24L24 42H15L30 27H0V44C0 46.2091 1.79086 48 4 48H44C46.2091 48 48 46.2091 48 44V4C48 1.79086 46.2091 0 44 0H4Z"/></svg>`,
	};

	/**
	 * Replaces image icons with dynamic SVGs inside the specified button
	 * 
	 * @param {HTMLElement} button - The button element containing an icon
	 */
	function replaceIcons(button) {
		const icon = button.querySelector(`img[class*='icon'i]`);
		if (!icon) return;

		const src = icon.getAttribute('src')
		for (const key in SVGs) {
			if (src.includes(key)) {
				const text = button.querySelector(`span[class*='buttontext'i]`)?.innerText || '';

				// Create a new wrapper div for the SVG and text
				const wrapper = document.createElement('div');
				wrapper.className = 'severitium-entrance-icon';
				wrapper.innerHTML = `
					<div>
						<svg viewBox="0 0 200 200" fill="none" class="border-visuals">
							<circle cx="100" cy="100" r="96"/>
						</svg>
						${SVGs[key]}
					</div>
					${text ? `<span>${text}</span>` : ''}
				`;

				button.innerHTML = '';
				button.appendChild(wrapper);
				break;
			}
		}
	}

	/**
	 * Processes added nodes and replaces static icons with SVGs
	 * 
	 * @param {MutationRecord} mutation - Mutation record containing added nodes
	 * @param {NodeList} mutation.addedNodes - List of nodes added to the DOM
	 */
	function processMutation({ addedNodes }) {
		addedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			// Check entrance buttons
			const entranceButtons = node.matches('.MainEntranceComponentStyle-container > div')
				? [node]
				: node.querySelectorAll('.MainEntranceComponentStyle-container > div');

			// Check registration buttons
			const registrationButtons = node.matches('.HeaderComponentStyle-headerLinkBar .SocialNetworksComponentStyle-container > div')
				? [node]
				: node.querySelectorAll('.HeaderComponentStyle-headerLinkBar .SocialNetworksComponentStyle-container > div');

			// Replace icons in all found buttons
			[...entranceButtons, ...registrationButtons].forEach(replaceIcons);
		});
	}

	// Creates a new MutationObserver instance to track changes in the DOM
	const observer = new MutationObserver(mutations => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => mutations.forEach(processMutation));
		} else {
			mutations.forEach(processMutation);
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	// Initial replacement of icons already present in the DOM
	document.querySelectorAll('.MainEntranceComponentStyle-container > div, .HeaderComponentStyle-headerLinkBar .SocialNetworksComponentStyle-container > div')
		.forEach(replaceIcons);
})();