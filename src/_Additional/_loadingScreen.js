// Function to create and display the loading screen
function createSeveritiumLoadingScreen() {
	// Define the CSS styles for the loading screen
	const loadingScreenStyles = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.8);
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	`;

	// Create a new div element for the loading screen
	const loadingScreen = document.createElement('div');
	loadingScreen.className = 'severitium-loading-screen';  // Set the class name for the element
	loadingScreen.setAttribute('data-module', 'SeveritiumLoadingScreen');  // Set the class name for the element
	loadingScreen.style.cssText = loadingScreenStyles;  // Apply the styles to the element

	// Set the text content for the loading screen
	loadingScreen.textContent = 'Loading resources, please wait...';

	// Append the loading screen to the body of the document
	document.body.appendChild(loadingScreen);
}

// Function to remove the loading screen from the page
function removeSeveritiumLoadingScreen() {
	// Find the loading screen element by its id
	const loadingScreen = document.querySelector('.severitium-loading-screen[data-module*="SeveritiumLoadingScreen"i]');

	// If the loading screen exists, remove it from the DOM
	if (loadingScreen) {
		loadingScreen.remove();
	}
}
