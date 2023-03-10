# node-mp3-player

A mp3 playing library which can play .mp3 audio from network and local for Node.js cli.

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

### Play Audio from Network

```JavaScript
const player = new Player()
// Equal to:
// const player = new Player({ mode: "network" })

player.src = "http://mp3audio.url"
await player.play()

// do something else ...
```

### Play Audio from Local

```JavaScript
const player = new Player({ mode: "local" })

player.src = "./audio.mp3"
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

### Error: the 2 AudioBuffers don't have the same sampleRate

**This error is fixed.**

This error will be thrown when some specific .mp3 audio is played and this error is thrown by the `web-audio-api` package, now the solution is unknown, but the "specific .mp3 audio" can be played overall.