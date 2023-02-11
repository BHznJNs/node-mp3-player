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

## Dependencies

- [web-audio-api](https://www.npmjs.com/package/web-audio-api)

- [speaker](https://www.npmjs.com/package/speaker)

- [axios](https://www.npmjs.com/package/axios)