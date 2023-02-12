import waa from "web-audio-api"
import Speaker from "speaker"
import Mp3 from "js-mp3"
import axios, { AxiosResponse, AxiosError } from "axios"

const {
    AudioContext: NodeAudioContext,
    AudioBuffer:  NodeAudioBuffer,
    GainNode: NodeGainNode,
    AudioBufferSourceNode: NodeAudioBufferSourceNode,
} = waa

interface Timer {
    start : number,
    offset: number,
    clear : Function,
}

class NodeMp3Player {
    isPlaying: boolean = false
    loop: boolean = false

    #currentUrl: string = ""
    #volume: number = 1
    #timer: Timer = {
        start: 0,
        offset: 0, // 播放进度
        clear() {
            this.start  = 0
            this.offset = 0
        }
    }

    #currentBuffer: typeof NodeAudioBuffer
    #gainNode: any | typeof NodeGainNode = null
    #sourceNode: any | typeof NodeAudioBufferSourceNode = null
    #audioContext: any | typeof NodeAudioContext = null

    constructor() {
        this.#audioContext = new NodeAudioContext()
    }

    public get currentTime(): number {
        return this.#audioContext.currentTime
    }
    public get src(): string {
        return this.#currentUrl
    }
    public set src(newVal: string) {
        this.stop()
        this.#sourceNode = null
        this.#currentUrl = newVal
        this.#timer.clear()
    }
    public get volume(): number {
        return this.#volume
    }
    public set volume(newVal: number) {
        // 音量限幅
        newVal = (newVal > 1) ? 1 : newVal
        newVal = (newVal < 0) ? 0 : newVal

        this.#volume = newVal
        this.#gainNode.gain.value = newVal;
    }
    public get onended() {
        return this.#sourceNode.onended
    }
    public set onended(newVal: Function) {
        this.#sourceNode.onended = newVal
    }

    async #getBuffer(): Promise<typeof NodeAudioBuffer> {
        const url = this.#currentUrl

        return new Promise((resolve, reject) => {
            axios.get(url, {
                // Use this to get `ArrayBuffer`
                // typed response.
                responseType: "arraybuffer"
            })
            .then((res: AxiosResponse) => res.data)
            .then((buffer: typeof Buffer) => {
                this.#audioContext.decodeAudioData(
                    buffer,
                    (audioBuffer: typeof NodeAudioBuffer) => {
                        const sampleRate: number = audioBuffer["sampleRate"]
                        this.#audioContext.sampleRate = sampleRate

                        const speaker = new Speaker({
                            channels: this.#audioContext.format.numberOfChannels,
                            bitDepth: this.#audioContext.format.bitDepth,
                            sampleRate,
                        })

                        this.#audioContext.outStream = speaker
                        this.#gainNode = this.#audioContext.createGain()
                        this.#gainNode.gain.value = this.#volume
                        this.#gainNode.connect(this.#audioContext.destination)

                        resolve(audioBuffer)
                    },
                    (err: Error) => {
                        reject(err)
                    }
                )
            })
            .catch((err: AxiosError) => {
                // from axios sample code
                if (err.response) {
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                } else if (err.request) {
                    console.log(err.request)
                } else {
                    console.log(err.message)
                }
                console.log(err.config)
            })
        })
    }

    // 创建可以被直接使用的 sourceNode
    #sourceNodeFactory(buffer: typeof NodeAudioBuffer, loop: boolean) {
        const source: any =
            this.#audioContext.createBufferSource()

        if (this.#sourceNode) {
            source.onended = this.#sourceNode.onended
        }
        source.buffer = buffer
        source.loop   = loop
        source.connect(this.#gainNode)

        this.#sourceNode = source
        return source
    }

    public async play() {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            return null
        }

        const buffer: typeof NodeAudioBuffer =
            this.#currentBuffer =
            await this.#getBuffer()
        const source = this.#sourceNodeFactory(buffer, this.loop)
        source.start(0)

        this.#timer.start = this.currentTime
        this.isPlaying = true
        return true
    }
    public resume() {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            return null
        }
        const source = this.#sourceNodeFactory(this.#currentBuffer, this.loop)
        source.start(0, this.#timer.offset)
        this.#timer.start = this.currentTime

        this.isPlaying = true
        return true
    }
    public stop() {
        if (this.#sourceNode) {
            this.#sourceNode.stop(0)
            this.isPlaying = false
            if (!this.#timer.offset) {
                this.#timer.offset = this.currentTime - this.#timer.start
            } else {
                this.#timer.offset += this.currentTime - this.#timer.start
            }
        }
    }
}

export default NodeMp3Player