declare class NodeMp3Player {
    #private;
    isPlaying: Boolean;
    constructor();
    get currentTime(): number;
    get src(): string;
    set src(newVal: string);
    get volume(): number;
    set volume(newVal: number);
    private getBuffer;
    play(isLoop: Boolean): Promise<boolean>;
    stop(): void;
}
export default NodeMp3Player;
