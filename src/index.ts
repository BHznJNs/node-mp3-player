import waa from "web-audio-api"
import Speaker from "speaker"
import axios, { AxiosResponse } from "axios"

const {
    AudioContext: NodeAudioContext,
    AudioBuffer:  NodeAudioBuffer,
    GainNode: NodeGainNode,
    AudioBufferSourceNode: NodeAudioBufferSourceNode,
} = waa

class NodeMp3Player {
    isPlaying: Boolean = false

    #currentUrl: string = ""
    #volume: number = 100

    #speaker: Speaker | null = null
    #gainNode: typeof NodeGainNode = null
    #sourceNode: typeof NodeAudioBufferSourceNode = null
    #audioContext: typeof NodeAudioContext = null

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
    }
    public get volume(): number {
        return this.#volume
    }
    public set volume(newVal: number) {
        this.#volume = newVal
        this.#gainNode.gain.value = newVal;
    }

    private async getBuffer() {
        const url = this.#currentUrl

        return new Promise((resolve, reject) => {
            axios.get(url, {
                // Use this to get `ArrayBuffer`
                // typed response.
                responseType: "arraybuffer"
            })
            .then((res: AxiosResponse) => res.data)
            .then((buffer: typeof NodeAudioBuffer) => {
                this.#audioContext.decodeAudioData(
                    buffer,
                    (audioBuffer: AudioBuffer) => {
                        resolve(audioBuffer)
                    },
                    (err: Error) => {
                        reject(err)
                    }
                )
            })
        })
    }

    public async play(isLoop: Boolean) {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            console.warn("NodeMp3Player Error: invalid music url: " + this.#currentUrl)
            return null
        }
        const source: typeof NodeAudioBufferSourceNode =
            this.#sourceNode =
            this.#audioContext.createBufferSource()
        const buffer: typeof NodeAudioBuffer = await this.getBuffer()
        source.buffer = buffer
        source.loop   = isLoop
        source.connect(this.#gainNode)
        source.start(0)
        this.isPlaying = true

        return true
    }
    public stop() {
        if (this.#sourceNode) {
            this.#sourceNode.stop(this.currentTime)
            this.isPlaying = false
        }
    }
}

export default NodeMp3Player