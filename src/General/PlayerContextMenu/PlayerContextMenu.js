(function() {
	/**
	 * Sets the background-color on hover to elements inside modal based on their text color
	 * 
	 * @param {HTMLElement} modal - The modal element to clone
	*/
	function configureElementHover(modal) {
		// Get all spans inside the modal
		const spans = modal.querySelectorAll('.ContextMenuStyle-menu > div > span');

		// Array to store unique IDs
		const usedIds = [];

		for (const span of spans) {
			// Get the color of the span
			const spanColor = window.getComputedStyle(span).color;

			// Get the parent div
			const parentDiv = span.closest('div');

			// Generate unique id
			let uniqueId;
			do {
				uniqueId = 'severitiumID-PCM-' + Math.random().toString(36).substring(7);
			} while (usedIds.includes(uniqueId)); // Check uniqueness
			
			usedIds.push(uniqueId); // Add id to usedIds

			// Set unique id for the span
            parentDiv.id = uniqueId;

			// Check if the span color is red
			if (spanColor === 'rgb(255, 124, 124)') {
				// Create new style
				var style = document.createElement('style');

				// Style inner
				style.innerHTML = `.ContextMenuStyle-menu > div#${uniqueId} > span { color: var(--severitium-red-text-color); } .ContextMenuStyle-menu > div#${uniqueId}:hover { background-color: rgba(225, 75, 75, 0.1) !important; } .ContextMenuStyle-menu > div#${uniqueId}:hover::before { background-color: rgba(225, 75, 75, 0.75) !important; }`;

				// Append style to modal
				modal.appendChild(style);
			}
		}
	}

	/**
	 * Generates a unique identifier based on the current timestamp
	 * 
	 * @returns {string} - The generated unique identifier
	*/
	function createIDFromDate() {
		return Date.now().toString();
	}

	// Original modal clone
	let clonedModals = [];

	/**
	 * Clones the provided modal element and adds necessary attributes for cloning
	 * 
	 * @param {HTMLElement} modal - The modal element to clone
	*/
	function cloneModal(modal) {
		const clonedModal = modal.cloneNode(true);
		// Classlist of container contains 'cloned'
		clonedModal.classList.add('cloned');
		const contextMenu = clonedModal.querySelector('.ContextMenuStyle-menu');
		const realContextMenu = modal.querySelector('.ContextMenuStyle-menu');

		// Create unique ID for each modal
		const ModalID = createIDFromDate();

		if (contextMenu) {
			// Context menu container has value of data: 'data-clone = true'
			contextMenu.dataset.clone = 'true';
			// Adds an ID number to 'shadow' modal
			contextMenu.setAttribute('data-mid', ModalID);

			// Add the modal into the array
			clonedModals.push({ ModalID, clonedModal });
		}

		if (realContextMenu) {
			// Set modal ID to the existing modal
			realContextMenu.setAttribute('data-mid', ModalID);
		}
	}

	/**
	 * Applies the fadeOutDown animation class to the cloned modal element
	 * Removes the cloned modal element from the page after the animation ends
	*/
	function applyFadeOutAnimation(ModalID) {
		const modalRoot = document.getElementById('modal-root');
		const clonedModalObj = clonedModals.find(item => item.ModalID === ModalID);

		if (clonedModalObj) {
			modalRoot.appendChild(clonedModalObj.clonedModal);
		}

		const clone = modalRoot.querySelector('.modal.cloned');
		
		if (clone) {
			const contextMenu = clone.querySelector(`.ContextMenuStyle-menu[data-clone='true'][data-mid='${ModalID}']`);

			if (contextMenu) {
				// Add the fadeOutDown class after the previous animation has ended
				contextMenu.classList.add('fadeOutDown');

				// Add another event listener to remove the element after the fadeOutDown animation
				contextMenu.addEventListener('animationend', function() {
					// Remove the temporary element after the animation ends
					modalRoot.removeChild(clone);
					
					// Remove the object of modal from the array
					clonedModals = clonedModals.filter(item => item.ModalID !== ModalID);
				});
			}
		}
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM 
	*/
	const observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') { // If the change is of type childList
				mutation.addedNodes.forEach(function (node) { // Iterate through added nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Check if the node is needed element
						if (node.classList && node.classList.contains('modal') && !node.classList.contains('cloned')) {
							// If inside modal there is a player's context menu element
							const contextMenu = node.querySelector('.ContextMenuStyle-menu');
							if (contextMenu) {
								// Clone it
								cloneModal(node);
								configureElementHover(node);
							}
						}
					}
				});

				mutation.removedNodes.forEach(function(node) { // Iterate through removed nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Check if the node is needed element
						if (node.classList && node.classList.contains('ContextMenuStyle-menu') && !node.dataset.clone) {
							// Extract ModalID from the removed node and apply the fade out animation
							const ModalID = node.getAttribute('data-mid');
							if (ModalID) {
								applyFadeOutAnimation(ModalID);
							}
						}
					}
				});
			}
		});
	});

	// Configuration for the mutation observer
	const observerConfig = { childList: true, subtree: true };

	// Start observing mutations in the document body
	observer.observe(document.body, observerConfig);
})();