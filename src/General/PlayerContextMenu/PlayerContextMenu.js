(function () {
	/**
	 * Sets the background-color on hover to elements inside modal based on their text color
	 * 
	 * @param {HTMLElement} modal - The modal element to configure
	 */
	function configureElementHover(modal) {
		const spans = modal.querySelectorAll('.ContextMenuStyle-menu > div > span');
		const usedIds = new Set();

		spans.forEach(span => {
			const spanColor = window.getComputedStyle(span).color;
			const parentDiv = span.closest('div');

			// Generate unique id
			let uniqueId;
			do {
				uniqueId = 'severitiumID-PCM-' + Math.random().toString(36).substring(7);
			} while (usedIds.has(uniqueId));

			usedIds.add(uniqueId);
			parentDiv.id = uniqueId;

			// Check if the span color is red
			if (spanColor === 'rgb(255, 124, 124)') {
				const style = document.createElement('style');
				style.innerHTML = `
					.ContextMenuStyle-menu > div#${uniqueId} > span { color: var(--severitium-red-text-color); }
					.ContextMenuStyle-menu > div#${uniqueId}:hover { background-color: rgba(225, 75, 75, 0.1) !important; }
					.ContextMenuStyle-menu > div#${uniqueId}:hover::before { background-color: rgba(225, 75, 75, 0.75) !important; }
				`;
				modal.appendChild(style);
			}
		});
	}

	// Store cloned modals in a Map for faster lookup
	const clonedModals = new Map();
	// Cache for existing UUIDs to avoid duplicates
	const existingUUIDs = new Map();

	/**
	 * Generates a unique UUID that is not already used by existing sort elements
	 * 
	 * @returns {string} - A unique UUID
	 */
	function generateUniqueUUID() {
		let uuid;
		do {
			uuid = crypto.randomUUID();
		} while (existingUUIDs.has(uuid));
		existingUUIDs.set(uuid, true);
		return uuid;
	}

	/**
	 * Clones the provided modal element and adds necessary attributes for cloning
	 * 
	 * @param {HTMLElement} modal - The modal element to clone
	 */
	function cloneModal(modal) {
		const clonedModal = modal.cloneNode(true);
		clonedModal.classList.add('cloned');

		const contextMenu = clonedModal.querySelector('.ContextMenuStyle-menu');
		const realContextMenu = modal.querySelector('.ContextMenuStyle-menu');

		const ModalID = crypto.generateUniqueUUID();

		if (contextMenu) {
			contextMenu.dataset.clone = 'true';
			contextMenu.dataset.mid = ModalID;
			clonedModals.set(ModalID, clonedModal);
		}

		if (realContextMenu) {
			realContextMenu.dataset.mid = ModalID;
		}
	}

	/**
	 * Applies fadeOut animation and removes the cloned modal
	 * 
	 * @param {string} ModalID - The ID of the modal to remove
	 */
	function applyFadeOutAnimation(ModalID) {
		const modalRoot = document.getElementById('modal-root');
		const clonedModal = clonedModals.get(ModalID);

		if (clonedModal) {
			modalRoot.appendChild(clonedModal);
		}

		const clone = modalRoot.querySelector('.modal.cloned');
		if (clone) {
			const contextMenu = clone.querySelector(`.ContextMenuStyle-menu[data-clone='true'][data-mid='${ModalID}']`);

			if (contextMenu) {
				contextMenu.classList.add('fadeOutDown');
				contextMenu.addEventListener('animationend', () => {
					modalRoot.removeChild(clone);
					clonedModals.delete(ModalID);
				});
			}
		}
	}

	/**
	 * Process mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - List of observed mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (!node.classList.contains('modal') || node.classList.contains('cloned')) return;

				const contextMenu = node.querySelector('.ContextMenuStyle-menu');
				if (contextMenu) {
					cloneModal(node);
					configureElementHover(node);
				}
			});

			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (!node.classList.contains('ContextMenuStyle-menu') || node.dataset.clone) return;

				const ModalID = node.getAttribute('data-mid');
				if (ModalID) {
					applyFadeOutAnimation(ModalID);
				}
			});
		});
	}

	// Create a new instance of MutationObserver
	const observer = new MutationObserver((mutations) => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
		} else {
			processMutations(mutations);
		}
	});

	// Start observing mutations in the document body
	observer.observe(document.body, { childList: true, subtree: true });

})();