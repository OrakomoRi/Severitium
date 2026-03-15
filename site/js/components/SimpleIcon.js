const cache = new Map();

export default class SimpleIcon extends HTMLElement {
	async connectedCallback() {
		const name = this.getAttribute('name');
		if (!name) return;

		const shadow = this.attachShadow({ mode: 'open' });

		shadow.innerHTML = `
		<style>
			:host {
				display: inline-flex;
				width: 1em;
				height: 1em;
			}
			svg {
				width: 100%;
				height: 100%;
				fill: currentColor;
			}
		</style>
		<div class="icon-inner"></div>
		`;

		let svg;
		if (cache.has(name)) {
			svg = cache.get(name);
		} else {
			const r = await fetch(`/site/images/icons/${name}.svg`);
			svg = await r.text();
			cache.set(name, svg);
		}

		shadow.querySelector('.icon-inner').innerHTML = svg;
	}
}

customElements.define('simple-icon', SimpleIcon);