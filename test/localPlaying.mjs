import Player from "../build/esm/index.mjs"

const player = new Player({ mode: "local"})

player.src = "./Never Gonna Give You Up.mp3"

player.play()