# :sparkles: Additional

There are saved additional functions that can be used for some unique actions.

---

## :maple_leaf: Get Season function

It works using current date ```new Date().getMonth() + 1``` to detect current month.

## :bulb: How to use

```js
_getSeason();
```

### :fire: Output

It returns the name of the current season: `spring`/`summer`/`autumn`/`winter`.

---

## :arrows_counterclockwise: Image to Base64

Takes URL to the image and converts it to Base64 Data URI.

### :warning: Warning

The function doesn't work in Tampermonkey.

## :bulb: How to use

```js
imageToBase64('imageUrl', function (base64Image) {
	console.log(base64Image);
});
```

### :mag: Description

Creates canvas to draw image there. When the image is fully loaded it converts the image into Base64 Data URI in callback function argument.

---

## :package: Loading Screen

A set of functions for creating and removing a custom loading screen. This can be used to display a loading screen while waiting for resources to load.

### :bulb: How to use

```js
// Create and display the loading screen
_createSeveritiumLoadingScreen();

// Remove the loading screen when resources are ready
_removeSeveritiumLoadingScreen();
```

### :mag: Description

- `_createSeveritiumLoadingScreen()`: This function creates and displays a full-screen loading overlay
- `_removeSeveritiumLoadingScreen()`: This function removes the loading screen from the page once resources are loaded or when you no longer need the loading indicator

The loading screen is added using a unique class `severitium-loading-screen` and a custom data attribute `data-module="SeveritiumLoadingScreen"`, which ensures that it won't conflict with other elements on the page.

---

## :capital_abcd: Extract File Name and Type

Extracts the file name from a given `repository` URL and determines if it is a CSS file or an image.

### :warning: Warning

The function is useful only for the this repository.

### :bulb:  How to use

```js
_extractFileName(url);

// For example: 
_extractFileName('/src/.images/icons/logo.png');
```

### :mag: Description

Returns an object with the extracted file name and its type.

```js
{
	fileName: "icons/logo",
	fileType: "(image)"
}
```

- The function checks if the given URL contains `/src/.images/` to determine if it refers to an image.
- If it is an image, it extracts the file path within `.images/` and labels it as `"(image)"`.
- Otherwise, it assumes the file is a CSS file and extracts its path, labeling it as `"(CSS)"`.
- If the pattern doesn’t match, it returns `"Unknown"` as the file name and `"(Unknown)"` as the type.

This function is useful for categorizing and handling file types dynamically.

---