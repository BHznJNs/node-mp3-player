import waa from "web-audio-api"
import Speaker from "speaker"
import axios, { AxiosResponse } from "axios"

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
        offset: 0,
        clear() {
            this.start  = 0
            this.offset = 0
        }
    }

    #speaker: Speaker
    #currentBuffer: typeof NodeAudioBuffer
    #gainNode: any | typeof NodeGainNode = null
    #sourceNode: any | typeof NodeAudioBufferSourceNode = null
    #audioContext: any | typeof NodeAudioContext = null

    constructor() {
        this.#audioContext = new NodeAudioContext()
        this.#speaker = new Speaker({
            channels: this.#audioContext.format.numberOfChannels,
            bitDepth: this.#audioContext.format.bitDepth,
            sampleRate: this.#audioContext.sampleRate
        })
        this.#audioContext.outStream = this.#speaker
        this.#gainNode = this.#audioContext.createGain()
        this.#gainNode.connect(this.#audioContext.destination)
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
        this.#volume = newVal
        this.#gainNode.gain.value = newVal;
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
                        resolve(audioBuffer)
                    },
                    (err: Error) => {
                        reject(err)
                    }
                )
            })
        })
    }

    // 创建可以被直接使用的 sourceNode
    #sourceNodeFactory(buffer: typeof NodeAudioBuffer, loop: boolean) {
        const source: any =
            this.#sourceNode =
            this.#audioContext.createBufferSource()
        source.buffer = buffer
        source.loop   = loop
        source.connect(this.#gainNode)

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
        this.isPlaying = true
        return true
    }
    public stop() {
        if (this.#sourceNode) {
            this.#sourceNode.stop(0)
            this.isPlaying = false
            this.#timer.offset = this.currentTime - this.#timer.start
        }
    }
}

export default NodeMp3Player