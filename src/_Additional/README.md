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
createSeveritiumLoadingScreen();

// Remove the loading screen when resources are ready
removeSeveritiumLoadingScreen();
```

### :mag: Description

- `createSeveritiumLoadingScreen()`: This function creates and displays a full-screen loading overlay
- `removeSeveritiumLoadingScreen()`: This function removes the loading screen from the page once resources are loaded or when you no longer need the loading indicator

The loading screen is added using a unique class `severitium-loading-screen` and a custom data attribute `data-module="SeveritiumLoadingScreen"`, which ensures that it won't conflict with other elements on the page.

---