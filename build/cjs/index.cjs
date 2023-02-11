"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_audio_api_1 = __importDefault(require("web-audio-api"));
const speaker_1 = __importDefault(require("speaker"));
const axios_1 = __importDefault(require("axios"));
const { AudioContext: NodeAudioContext, AudioBuffer: NodeAudioBuffer, GainNode: NodeGainNode, AudioBufferSourceNode: NodeAudioBufferSourceNode, } = web_audio_api_1.default;
class NodeMp3Player {
    isPlaying = false;
    loop = false;
    #currentUrl = "";
    #volume = 1;
    #timer = {
        start: 0,
        offset: 0,
        clear() {
            this.start = 0;
            this.offset = 0;
        }
    };
    #speaker;
    #currentBuffer;
    #gainNode = null;
    #sourceNode = null;
    #audioContext = null;
    constructor() {
        this.#audioContext = new NodeAudioContext();
        this.#speaker = new speaker_1.default({
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
        this.#timer.clear();
    }
    get volume() {
        return this.#volume;
    }
    set volume(newVal) {
        newVal = (newVal > 1) ? 1 : newVal;
        newVal = (newVal < 0) ? 0 : newVal;
        this.#volume = newVal;
        this.#gainNode.gain.value = newVal;
    }
    get onended() {
        return this.#sourceNode.onended;
    }
    set onended(newVal) {
        this.#sourceNode.onended = newVal;
    }
    async #getBuffer() {
        const url = this.#currentUrl;
        return new Promise((resolve, reject) => {
            axios_1.default.get(url, {
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
    #sourceNodeFactory(buffer, loop) {
        const source = this.#sourceNode =
            this.#audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(this.#gainNode);
        return source;
    }
    async play() {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            return null;
        }
        const buffer = this.#currentBuffer =
            await this.#getBuffer();
        const source = this.#sourceNodeFactory(buffer, this.loop);
        source.start(0);
        this.#timer.start = this.currentTime;
        this.isPlaying = true;
        return true;
    }
    resume() {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            return null;
        }
        const source = this.#sourceNodeFactory(this.#currentBuffer, this.loop);
        source.start(0, this.#timer.offset);
        this.#timer.start = this.currentTime;
        this.isPlaying = true;
        return true;
    }
    stop() {
        if (this.#sourceNode) {
            this.#sourceNode.stop(0);
            this.isPlaying = false;
            if (!this.#timer.offset) {
                this.#timer.offset = this.currentTime - this.#timer.start;
            }
            else {
                this.#timer.offset += this.currentTime - this.#timer.start;
            }
        }
    }
}
exports.default = NodeMp3Player;
