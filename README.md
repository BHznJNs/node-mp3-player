# node-mp3-player

A mp3 playing library for Node.js cli.

## Installation

```shell
npm i @bhznjns/node-mp3-player
```

## Example

```JavaScript
import Player from "@bhznjns/node-mp3-player"

const player = new Player()
player.src = "http://audio.url"
player.volume = 1
await player.play()

setTimeout(() => {
    player.stop()
}, 5000)
```