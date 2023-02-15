import fs from "node:fs"
import waa from "web-audio-api"
import Speaker from "speaker"
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
    clear(): void,
}

class NodeMp3Player {
    isPlaying: boolean = false
    loop: boolean = false

    #currentUrl: string = ""
    #srcFrom: number = 0 // 0 -> network | 1 -> local
    #volume: number = 1
    #timer: Timer = {
        start: 0,
        offset: 0, // 播放进度
        clear() {
            this.start  = 0
            this.offset = 0
        }
    }

    #currentBuffer: any | typeof NodeAudioBuffer = null
    #gainNode: any | typeof NodeGainNode = null
    #sourceNode: any | typeof NodeAudioBufferSourceNode = null
    #audioContext: any | typeof NodeAudioContext = null

    constructor({ mode = "network" } = {}) {
        this.#audioContext = new NodeAudioContext()

        if (mode === "network") {
            this.#srcFrom = 0
        } else if (mode === "local") {
            this.#srcFrom = 1
        } else {
            console.warn("Unknown Player Mode: " + mode)
            this.#srcFrom = 0
        }
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
        if (this.#gainNode) this.#gainNode.gain.value = newVal;
    }
    public get onended() {
        return this.#sourceNode.onended
    }
    public set onended(newVal: Function) {
        if (this.#sourceNode) {
            this.#sourceNode.onended = newVal
        }
    }

    #resetSampleRate(audioBuffer: typeof NodeAudioBuffer): void {
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
    }
    async #getBufferFromNetWork(): Promise<typeof NodeAudioBuffer | null> {
        const url = this.#currentUrl

        return new Promise((resolve) => {
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
                        this.#resetSampleRate(audioBuffer)
                        resolve(audioBuffer)
                    },
                    (err: Error) => {
                        console.log(err.message)
                        resolve(null)
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
    async #getBufferFromLocal(): Promise<typeof NodeAudioBuffer | null> {
        return new Promise((resolve) => {

            let audioContent!: Buffer
            try {
                audioContent = fs.readFileSync(this.src)
            } catch {
                console.log("File Reading Error: reading " + this.src)
                resolve(null)
            }

            this.#audioContext.decodeAudioData(
                audioContent,
                (audioBuffer: typeof NodeAudioBuffer) => {
                    this.#resetSampleRate(audioBuffer)
                    resolve(audioBuffer)
                },
                (err: Error) => {
                    console.log(err.message)
                    resolve(null)
                },
            )
        })
    }
    async #getBuffer(): Promise<typeof NodeAudioBuffer | null> {
        if (this.#srcFrom === 0) {
            return await this.#getBufferFromNetWork()
        } else {
            return await this.#getBufferFromLocal()
        }
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

        const buffer: typeof NodeAudioBuffer | null =
            this.#currentBuffer =
            await this.#getBuffer()
        if (!buffer) return

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