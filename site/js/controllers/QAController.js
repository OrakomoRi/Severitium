export default class QAController {
	init() {
		document.querySelectorAll('.qa-question').forEach(q => {
			q.addEventListener('click', () => this._toggle(q));
		});
	}

	_toggle(el) {
		const answer = el.nextElementSibling;
		const isOpen = answer.classList.contains('open');
		document.querySelectorAll('.qa-answer.open').forEach(a => {
			a.classList.remove('open');
			a.previousElementSibling.classList.remove('active');
		});
		if (!isOpen) {
			answer.classList.add('open');
			el.classList.add('active');
		}
	}
}
