export default class PathCopyController {
	init() {
		document.querySelectorAll('.step-path').forEach(path => {
			const code = path.querySelector('.step-code');
			if (!code) return;

			const text = code.textContent.trim();

			const btn = document.createElement('button');
			btn.className = 'step-path-copy';
			btn.setAttribute('aria-label', 'Copy path');
			btn.innerHTML = '<ion-icon name="copy-outline"></ion-icon>';

			btn.addEventListener('click', async () => {
				try {
					await navigator.clipboard.writeText(text);
					btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>';
					btn.classList.add('step-path-copy--done');
					setTimeout(() => {
						btn.innerHTML = '<ion-icon name="copy-outline"></ion-icon>';
						btn.classList.remove('step-path-copy--done');
					}, 1500);
				} catch {
					// clipboard not available
				}
			});

			code.appendChild(btn);
		});
	}
}
