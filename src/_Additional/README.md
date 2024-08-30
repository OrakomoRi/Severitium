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