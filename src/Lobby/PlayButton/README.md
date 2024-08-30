# :sparkles: Play Button

Play button in the lobby. Button logic when searching for a battle, default state of the button.

The default state of the button became static, so as not to burden the user with unnecessary animations. But when searching for a battle or being in a group, the user sees the animation of the button. This makes it easier for the user to understand the current state of the lobby.

The button animation is always random, and the color of the button depends on the main color of the theme selected by the user.

## :bulb: Single module

You can manually use this component by enabling the [script](https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/PlayButton/PlayButton.user.js?raw=true) in Tampermonkey.

## :information_source: Design

### Play button default state

#### Old

![](/images/lobby/old/playbutton-default.gif)

#### New

![](/images/lobby/new/playbutton-default.png)

### Play button search state

#### Old

![](/images/lobby/old/playbutton-search.gif)

#### New

![](/images/lobby/new/playbutton-search.gif)