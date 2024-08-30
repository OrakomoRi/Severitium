(function() {
	document.body.addEventListener('mousemove', function(e) {
		var button = e.target.closest('.SuperMissionComponentStyle-descriptionSuperMission div.SuperMissionComponentStyle-buttonCollect');
		if (button) {
			const rect = button.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			button.style.setProperty('--severitium-superquest-button-x', x + 'px');
			button.style.setProperty('--severitium-superquest-button-y', y + 'px');
		}
	});
})();