(function () {
	let lastX = 0, lastY = 0;
	let ticking = false;

	document.body.addEventListener('mousemove', (e) => {
		// Find the closest matching button element
		const button = e.target.closest('.SuperMissionComponentStyle-descriptionSuperMission div.SuperMissionComponentStyle-buttonCollect');
		if (!button) return;

		// Get the button's position relative to the viewport
		const rect = button.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Update styles only if coordinates have changed
		if (x !== lastX || y !== lastY) {
			lastX = x;
			lastY = y;

			// Use requestAnimationFrame to optimize rendering
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(() => {
					button.style.setProperty('--severitium-superquest-button-x', `${lastX}px`);
					button.style.setProperty('--severitium-superquest-button-y', `${lastY}px`);
					ticking = false;
				});
			}
		}
	}, { passive: true }); // Improve performance by making the event listener passive
})();