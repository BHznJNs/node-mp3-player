import Player from "../build/esm/index.mjs"

const player = new Player()
player.src = "https://music.163.com/song/media/outer/url?id=2061453.mp3"
await player.play()

setTimeout(() => {
    player.stop()
}, 5000)

setTimeout(() => {
    player.resume()
}, 10000)

setTimeout(() => {
    player.stop()
}, 15000)

setTimeout(() => {
    player.resume()
}, 20000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061452.mp3"
//     await player.play()
// }, 6000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061451.mp3"
//     await player.play()
// }, 12000)