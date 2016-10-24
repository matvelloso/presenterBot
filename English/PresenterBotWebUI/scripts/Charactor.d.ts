/// <reference path="typings/createjs/createjs.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
declare var images: any;
declare function getAllValues<V>(dictionary: {
    [name: string]: V;
}): V[];
declare class Charactor {
    stage: createjs.Stage;
    rootClip: createjs.MovieClip;
    movies: Movie[];
    moviesByName: {
        [name: string]: Movie;
    };
    constructor(stage: createjs.Stage);
    getAnimation(animationName: string, movieName?: string): Animation;
    play(animationName: string, movieName?: string, shouldRepeat?: () => boolean): JQueryPromise<void>;
    playLoop(animationName: string, parentClip: createjs.MovieClip): void;
    reset: (animationOrMovieName?: string) => JQueryPromise<void>;
    setStartState: (state: string) => void;
    animate: (target?: any) => createjs.Tween;
    setBitmapImage: (name: string, url: string, sourceRect?: createjs.Rectangle) => JQueryPromise<{}>;
}
declare const NEUTRAL_STATE: string;
declare class Movie {
    name: string;
    animations: {
        [name: string]: Animation;
    };
    animationQueue: AnimationEntry[];
    currentAnimation: AnimationEntry;
    clip: createjs.MovieClip;
    stopFrames: number[];
    bitmaps: {
        [name: string]: createjs.Bitmap;
    };
    text: {
        [name: string]: createjs.Text;
    };
    state: string;
    stateChanged: () => void;
    onStateChanged: (state: string) => void;
    constructor(clip: createjs.MovieClip, name: string);
    reset: () => JQueryPromise<void>;
    setResetState(animationName: string): void;
    handleEndAnimationIfNeeded: () => void;
    playNextAnimation: () => void;
    private setState(state);
    setBitmapImage: (name: string, url: string, sourceRect?: createjs.Rectangle) => void;
    setText: (name: string, text: string) => void;
}
declare class Animation {
    movie: Movie;
    doneAnimation: Animation;
    name: string;
    start: number;
    end: number;
    startState: string;
    endState: string;
    play: (shouldRepeat?: () => boolean) => JQueryPromise<void>;
}
interface AnimationEntry {
    animation: Animation;
    doneCallback?: () => void;
    shouldRepeat?: () => boolean;
}
