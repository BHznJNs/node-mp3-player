"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const web_audio_api_1 = __importDefault(require("web-audio-api"));
const speaker_1 = __importDefault(require("speaker"));
const axios_1 = __importDefault(require("axios"));
const { AudioContext: NodeAudioContext, AudioBuffer: NodeAudioBuffer, GainNode: NodeGainNode, AudioBufferSourceNode: NodeAudioBufferSourceNode, } = web_audio_api_1.default;
class NodeMp3Player {
    isPlaying = false;
    loop = false;
    #currentUrl = "";
    #srcFrom = 0;
    #volume = 1;
    #timer = {
        start: 0,
        offset: 0,
        clear() {
            this.start = 0;
            this.offset = 0;
        }
    };
    #gainNode = null;
    #sourceNode = null;
    #audioContext = null;
    #currentBuffer = null;
    constructor({ mode = "network" } = {}) {
        this.#audioContext = new NodeAudioContext();
        if (mode === "network") {
            this.#srcFrom = 0;
        }
        else if (mode === "local") {
            this.#srcFrom = 1;
        }
        else {
            console.warn("Unknown Player Mode: " + mode);
            this.#srcFrom = 0;
        }
    }
    get currentTime() {
        return this.#audioContext.currentTime;
    }
    get src() {
        return this.#currentUrl;
    }
    set src(newVal) {
        this.stop();
        this.#currentBuffer = null;
        this.#gainNode = null;
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
        if (this.#gainNode)
            this.#gainNode.gain.value = newVal;
    }
    get onended() {
        return this.#sourceNode.onended;
    }
    set onended(newVal) {
        if (this.#sourceNode) {
            this.#sourceNode.onended = newVal;
        }
    }
    #resetSampleRate(newSampleRate) {
        if (this.#gainNode)
            this.#gainNode.disconnect();
        const sampleRate = newSampleRate;
        this.#audioContext.sampleRate = sampleRate;
        const speaker = new speaker_1.default({
            channels: this.#audioContext.format.numberOfChannels,
            bitDepth: this.#audioContext.format.bitDepth,
            sampleRate,
        });
        this.#audioContext.outStream = speaker;
        this.#gainNode = this.#audioContext.createGain();
        this.#gainNode.gain.value = this.#volume;
        this.#gainNode.connect(this.#audioContext.destination);
    }
    async #getBufferFromNetWork() {
        const url = this.#currentUrl;
        return new Promise((resolve) => {
            axios_1.default.get(url, {
                responseType: "arraybuffer"
            })
                .then((res) => res.data)
                .then((buffer) => {
                this.#audioContext.decodeAudioData(buffer, (audioBuffer) => {
                    this.#resetSampleRate(audioBuffer.sampleRate);
                    resolve(audioBuffer);
                }, (err) => {
                    console.log(err.message);
                    resolve(null);
                });
            })
                .catch((err) => {
                if (err.response) {
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                }
                else if (err.request) {
                    console.log(err.request);
                }
                else {
                    console.log(err.message);
                }
                console.log(err.config);
            });
        });
    }
    async #getBufferFromLocal() {
        return new Promise((resolve) => {
            let audioContent;
            try {
                audioContent = node_fs_1.default.readFileSync(this.#currentUrl);
            }
            catch {
                console.log("File Reading Error: reading " + this.#currentUrl);
                resolve(null);
            }
            this.#audioContext.decodeAudioData(audioContent, (audioBuffer) => {
                this.#resetSampleRate(audioBuffer.sampleRate);
                resolve(audioBuffer);
            }, (err) => {
                console.log(err.message);
                resolve(null);
            });
        });
    }
    async #getBuffer() {
        if (this.#srcFrom === 0) {
            return await this.#getBufferFromNetWork();
        }
        else {
            return await this.#getBufferFromLocal();
        }
    }
    #sourceNodeFactory(buffer, loop) {
        const source = this.#audioContext.createBufferSource();
        if (this.#sourceNode) {
            source.onended = this.#sourceNode.onended;
        }
        source.buffer = buffer;
        source.loop = loop;
        source.connect(this.#gainNode);
        this.#sourceNode = source;
        return source;
    }
    async play() {
        if (!this.#currentUrl || (typeof this.#currentUrl !== "string")) {
            return false;
        }
        const buffer = this.#currentBuffer =
            await this.#getBuffer();
        if (!buffer)
            return false;
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
            this.#sourceNode.disconnect();
            this.#sourceNode.buffer = null;
            this.#sourceNode = null;
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
