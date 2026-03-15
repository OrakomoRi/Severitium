export default class InstallTabsController {
	init() {
		document.querySelectorAll('.itab').forEach(tab => {
			tab.addEventListener('click', () => this._switchTo(tab));
		});
	}

	_switchTo(btn) {
		const id = btn.dataset.tab;
		document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
		document.querySelectorAll('.itab-content').forEach(c => c.classList.remove('active'));
		btn.classList.add('active');
		document.querySelector(`[data-tab-content="${id}"]`)?.classList.add('active');
	}
}
