# node-mp3-player

A mp3 playing library which can play .mp3 audio from web for Node.js cli.

## Installation

```shell
npm i @bhznjns/node-mp3-player
```

## Example

```JavaScript
import Player from "@bhznjns/node-mp3-player"

const player = new Player()
player.src = "http://audio.url"
player.volume = 0.5 // 0 ~ 1
await player.play()

setTimeout(() => {
    player.stop()
}, 5000)

setTimeout(() => {
    player.resume()
}, 10000)

player.onended = () => {
    player.src = "http://otheraudio.url"
    await player.play()
}
```

## Usage

### Import

```JavaScript
// ESM
import Player from "@bhznjns/node-mp3-player"
// CJS
const { default: Player } = require("@bhznjns/node-mp3-player")
```

### Play

```JavaScript
const player = new Player()

player.src = "http://mp3audio.url"
await player.play()

// do something else ...
```

### Volume Control

```JavaScript
player.volume = 0.5 // Value is limited between 0 ~ 1
```

### Stop & Resume

```JavaScript
player.stop()

// resume after 5 seconds
setTimeout(() => {
    player.resume()
}, 5000)
```

### Onended Handle

```JavaScript
// after one audio end
player.onended = () => {
    // do something ...
}

// remove handler
player.onended = null
```

## Dependencies

- [web-audio-api](https://www.npmjs.com/package/web-audio-api)

- [speaker](https://www.npmjs.com/package/speaker)

- [axios](https://www.npmjs.com/package/axios)

## Possible Issues

### Error: Cannot find module 'abc'

```shell
npm i abc
```