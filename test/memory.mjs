import waa from "web-audio-api"
import Speaker from "speaker"
import axios from "axios"

const url = "https://music.163.com/song/media/outer/url?id=1991012773.mp3" // audio url
const context = new waa.AudioContext()
axios.get(url, {
    responseType: "arraybuffer"
})
    .then((res) => res.data)
    .then((buffer) => {
        context.decodeAudioData(buffer,
            (audioBuffer) => {
                let size = 0
                for (const item of audioBuffer._data) {
                    size += item.byteLength
                }
                console.log(size)
                // do something ... 
            },
            (err) => {
                // do something ...
            },
        )
});

setTimeout(() => {}, 20000)

// import AV from "av"
// import { decodeAudioData } from "web-audio-api/lib/utils.js"

// const url = "https://music.163.com/song/media/outer/url?id=1991012773.mp3"

// const context = new waa.AudioContext()
// const gain    = new waa.GainNode(context)
// const speaker = new Speaker({
//     channels: context.format.numberOfChannels,
//     bitDepth: context.format.bitDepth,
//     sampleRate: context.format.sampleRate,
// })
// context.outStream = speaker

// axios.get(url, {
//     responseType: "arraybuffer"
// })
//     .then((res) => res.data)
//     .then((buffer) => {
//         // decodeAudioData(buffer, function(err, audioBuffer) {})
//         const asset = AV.Asset.fromBuffer(buffer)

//         asset.decodeToBuffer(function(decoded) {
//             var deinterleaved = []
//               , numberOfChannels = asset.format.channelsPerFrame
//               , length = Math.floor(decoded.length / numberOfChannels)
//               , ch, chArray, i
        
//             for (ch = 0; ch < numberOfChannels; ch++)
//               deinterleaved.push(new Float32Array(length))
        
//             for (ch = 0; ch < numberOfChannels; ch++) {
//               chArray = deinterleaved[ch]
//               for (i = 0; i < length; i++)
//                 chArray[i] = decoded[ch + i * numberOfChannels]
//             }
//         })
// });

// setTimeout(() => {}, 10000)