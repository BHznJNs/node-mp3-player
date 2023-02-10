import waa from "web-audio-api";
import Speaker from "speaker";
import axios from "axios";
const { AudioContext: NodeAudioContext, AudioBuffer: NodeAudioBuffer, GainNode: NodeGainNode, AudioBufferSourceNode: NodeAudioBufferSourceNode, } = waa;
class NodeMp3Player {
    isPlaying = false;
    #currentUrl = "";
    #volume = 100;
    #speaker = null;
    #gainNode = null;
    #sourceNode = null;
    #audioContext = null;
    constructor() {
        this.#audioContext = new NodeAudioContext();
        this.#speaker = new Speaker({
            channels: this.#audioContext.format.numberOfChannels,
            bitDepth: this.#audioContext.format.bitDepth,
            sampleRate: this.#audioContext.sampleRate
        });
        this.#audioContext.outStream = this.#speaker;
        this.#gainNode = this.#audioContext.createGain();
        this.#gainNode.connect(this.#audioContext.destination);
    }
    get currentTime() {
        return this.#audioContext.currentTime;
    }
    get src() {
        return this.#currentUrl;
    }
    set src(newVal) {
        this.stop();
        this.#sourceNode = null;
        this.#currentUrl = newVal;
    }
    get volume() {
        return this.#volume;
    }
    set volume(newVal) {
        this.#volume = newVal;
        this.#gainNode.gain.value = newVal;
    }
    async getBuffer() {
        const url = this.#currentUrl;
        return new Promise((resolve, reject) => {
            axios.get(url, {
                responseType: "arraybuffer"
            })
                .then((res) => res.data)
                .then((buffer) => {
                this.#audioContext.decodeAudioData(buffer, (audioBuffer) => {
                    resolve(audioBuffer);
                }, (err) => {
                    reject(err);
                });
            });
        });
    }
    async play(isLoop) {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            console.warn("NodeMp3Player Error: invalid music url: " + this.#currentUrl);
            return null;
        }
        const source = this.#sourceNode =
            this.#audioContext.createBufferSource();
        const buffer = await this.getBuffer();
        source.buffer = buffer;
        source.loop = isLoop;
        source.connect(this.#gainNode);
        source.start(0);
        this.isPlaying = true;
        return true;
    }
    stop() {
        if (this.#sourceNode) {
            this.#sourceNode.stop(this.currentTime);
            this.isPlaying = false;
        }
    }
}
export default NodeMp3Player;
