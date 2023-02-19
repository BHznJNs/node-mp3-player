import Player from "../build/esm/index.mjs"
import heapdump from "heapdump"

const player = new Player()
player.src = "https://music.163.com/song/media/outer/url?id=2013921197.mp3"
await player.play()

heapdump.writeSnapshot("./memorysnap.heapsnapshot")


// const player = new Player()
// player.src = "https://music.163.com/song/media/outer/url?id=2061453.mp3"
// await player.play()


// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061452.mp3"
//     await player.play()
// }, 5000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061451.mp3"
//     await player.play()
// }, 10000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061450.mp3"
//     await player.play()
// }, 15000)




// const player = new Player({ mode: "network" })
// player.src = "https://music.163.com/song/media/outer/url?id=2061453.mp3"
// await player.play()

// player.onended = () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061452.mp3"
//     player.play()
// }

// setTimeout(() => {
//     player.stop()
// }, 5000)

// setTimeout(() => {
//     player.resume()
// }, 10000)

// setTimeout(() => {
//     player.stop()
// }, 15000)

// setTimeout(() => {
//     player.resume()
// }, 20000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061452.mp3"
//     await player.play()
// }, 6000)

// setTimeout(async () => {
//     player.src = "https://music.163.com/song/media/outer/url?id=2061451.mp3"
//     await player.play()
// }, 12000)