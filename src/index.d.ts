declare class NodeMp3Player {
    #private;
    isPlaying: boolean;
    loop: boolean;
    constructor();
    get currentTime(): number;
    get src(): string;
    set src(newVal: string);
    get volume(): number;
    set volume(newVal: number);
    get onended(): Function;
    set onended(newVal: Function);
    play(): Promise<boolean>;
    resume(): boolean;
    stop(): void;
}
export default NodeMp3Player;
