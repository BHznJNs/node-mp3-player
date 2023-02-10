const { default: Player } = require("../build/cjs/index.cjs")

const player = new Player()

;(async () => {
    player.src = "https://music.163.com/song/media/outer/url?id=2061453.mp3"
    await player.play()
    player.volume = 0.01
})();

setTimeout(async () => {
    player.stop()
    player.volume = 0.02
    player.src = "https://music.163.com/song/media/outer/url?id=2061452.mp3"
    await player.play()
}, 6000)

setTimeout(async () => {
    player.stop()
    player.volume = 0.03
    player.src = "https://music.163.com/song/media/outer/url?id=2061451.mp3"
    await player.play()
}, 12000)