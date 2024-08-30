/**
 * Function which takes an url to the image and makes image as Base64 code
 * 
 * @param {String} imageUrl - url to image
 * @param {Function} callback
*/

function _imageToBase64(imageUrl, callback) {
	// Create a new canvas element
	var canvas = document.createElement('canvas');
	// Obtain a 2D rendering context for the canvas
	var ctx = canvas.getContext('2d');
	// Create a new Image object
	var img = new Image();
	// Allow loading of cross-origin images without tainted canvas
	img.crossOrigin = 'Anonymous';

	// Define an onload event handler for the image
	img.onload = function () {
		// Set the width of the canvas to match the width of the image
		canvas.width = img.width;
		// Set the height of the canvas to match the height of the image
		canvas.height = img.height;
		// Draw the image onto the canvas at coordinates (0, 0)
		ctx.drawImage(img, 0, 0);
		// Convert the canvas content to a data URL representing the image
		var dataURL = canvas.toDataURL();
		// Invoke the callback function with the data URL as an argument
		callback(dataURL);
	};

	// Set the source URL of the image to the provided imageUrl
	img.src = imageUrl;
}