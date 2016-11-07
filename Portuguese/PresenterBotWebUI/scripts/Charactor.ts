/// <reference path="./typings/createjs/createjs.d.ts" />
/// <reference path="./typings/jquery/jquery.d.ts" />

declare var images: any;

function getAllValues<V>(dictionary: { [name: string]: V }): V[] {
    var result : V[] = [];
    for (var p in dictionary)
    {
        result.push(dictionary[p]);
    }
    return result;
}

class Charactor {
    stage: createjs.Stage;
    rootClip: createjs.MovieClip;
    movies: Movie[] = [];
    moviesByName: { [name: string]: Movie } = {};

    constructor(stage: createjs.Stage) {
        this.stage = stage;
        this.rootClip = <createjs.MovieClip>stage.children[0];

        var recurse = (parent: createjs.MovieClip, path: string, clip: createjs.MovieClip, movie: Movie) => {

            // set the charactor reference for use by the action script
            (clip as any).charactor = this;

            // make sure that later added movies dont automaticaly play
            clip.mode = createjs.MovieClip.INDEPENDENT;
            clip.autoReset = false;

            // output labels
            var name = getPropName(parent, clip);

            // make sure we aways start in a stopped state
            clip.gotoAndStop(0);

            var labels = clip.timeline.getLabels();
            if (labels && clip.timeline && labels.length > 0) {
                movie = new Movie(clip, path + name);
                this.movies.push(movie);
                this.moviesByName[movie.name] = movie;
            }
            
            for (var i = 0; i < clip.children.length; i++) {
                var mc = clip.children[i] as createjs.MovieClip;
                if (mc instanceof createjs.MovieClip)
                   recurse(clip, path + name + (path + name ? "." : ""), mc, movie);
            }

            // look for children recursivly
            for (var p in clip) {
                var mc = (clip as any)[p] as createjs.MovieClip;
                var bmp = (clip as any)[p] as createjs.Bitmap;
                var fullname = path + name;
                if (mc instanceof createjs.MovieClip && mc != clip.parent) {
                    if (clip.children.indexOf(mc) < 0)
                        recurse(clip, fullname + (fullname ? "." : ""), mc, movie);
                }
                else if (bmp instanceof createjs.Bitmap)
                {
                    var bi : any[] = (bmp.image as any).instances = (bmp.image as any).instances || [];
                    bi.push(bmp);
                    movie.bitmaps[fullname.substring(movie.name ? movie.name.length + 1 : 0)] = bmp;
                }
                else if (movie && (clip as any)[p] instanceof createjs.Text)
                    movie.text[(fullname + "." + p).substring(movie.name ? movie.name.length + 1 : 0)] = (clip as any)[p] as createjs.Text;                
            }
        };

        var getPropName = function (parent: any, clip: any) {
            for (var p in parent) {
                if (parent[p] === clip)
                    return p;
            }
            return "";
        }

        recurse(null, "", this.rootClip, null);
    }

    getAnimation(animationName: string, movieName: string = null): Animation {
        var anims: Animation[] = [];

        this.movies.forEach(m => {
            var anim = m.animations[animationName.toLowerCase()];
            if (anim)
                anims.push(anim);
        });

        if (anims.length == 1)
            return anims[0];
        else if (anims.length > 1 && movieName) 
            for (var i = 0; i < anims.length; i++) 
                if (new RegExp(movieName + "$").test(anims[i].movie.name))
                    return anims[i]
        return null;
    }

    play(animationName: string, movieName: string = null, shouldRepeat?: () => boolean) {
        var anim = this.getAnimation(animationName, movieName);
        if (anim)
            return anim.play(shouldRepeat);
    }

    playLoop(animationName: string, parentClip: createjs.MovieClip) {
        // find the movie for the clip
        var movie: Movie;
        for (var i = 0; i < this.movies.length; i++)
            if (this.movies[i].clip === parentClip)
                movie = this.movies[i];
        if (movie) {
            var loopState = movie.currentAnimation.animation.endState;
            var anim = this.getAnimation(animationName);
            if (anim)
                anim.play(() => movie.state == loopState);
        }
    }

    reset = (animationOrMovieName?: string) => {
        // reset only a specific animation
        if (animationOrMovieName) {
            var anim = this.getAnimation(animationOrMovieName);
            if (anim)
                return anim.movie.reset();

            var movie = this.moviesByName[animationOrMovieName];
            if (movie)
                return movie.reset();
        }
        else
            // reset everything;
            return $.when(this.movies.map(m => m.reset())) as JQueryPromise<any>;
    }

    setStartState = (state: string) => {
        // right now we assume the state is the same as the animation name
        var anim = this.getAnimation(state);
        if (anim) {
            anim.movie.currentAnimation = { animation: anim };
            anim.movie.clip.gotoAndStop(anim.end);
            anim.movie.state = state.toLowerCase();
        }
    }


    animate = (target: any = this.stage) => {
        return createjs.Tween.get(target, { override: false });
    }

    setBitmapImage = (name: string, url: string, sourceRect: createjs.Rectangle = null) => {
        var deferred = $.Deferred();
        var img = images[name];
        var bmps = img.instances as createjs.Bitmap[];

        img.src = url;
        bmps.forEach(bm => {
            // set the source rect if needed
            bm.sourceRect = sourceRect;

            $(img).on("load", () => {
                // set by adobe animate
                var bounds = (bm as any).nominalBounds as createjs.Rectangle;
                if (bounds)
                    bm.scaleX = bm.scaleY = Math.min(bounds.width / bm.getBounds().width, bounds.height / bm.getBounds().height);
                deferred.resolve();
            });
        });

        return deferred.promise();
    }
}

const NEUTRAL_STATE = "neutral";

class Movie {
    name: string;
    animations: { [name: string]: Animation } = {};
    animationQueue: AnimationEntry[] = [];
    currentAnimation: AnimationEntry
    clip: createjs.MovieClip;
    stopFrames: number[] = [0];
    bitmaps: { [name: string]: createjs.Bitmap } = {};
    text: { [name: string]: createjs.Text } = {};
    state = NEUTRAL_STATE;
    stateChanged: () => void;
    onStateChanged: (state: string) => void;

    constructor(clip: createjs.MovieClip, name: string) {
        this.clip = clip;
        this.name = name;

        clip.loop = false;

        clip.timeline.on("change", () => {
            // always stop on the first frame
            if (this.stopFrames.indexOf(this.clip.timeline.position) > -1)
                this.clip.paused = true;

            this.handleEndAnimationIfNeeded();

        });
        
        // add all the animations from stop frames
        var animation: Animation;
        var labels = clip.timeline.getLabels();

        // make sure that the label are correct and there is a reset animation
        if (labels[0].position == 1 || (labels.length > 1 && labels[1].position == 1)) {
            if (labels[0].position == 1)
                labels.unshift({ label: "Reset", position: 0 });
            else
                labels[0].label = "Reset";
        }
        else
            console.debug("MovieClip " + this.name + " is missing a first animation label on the second frame.  The first frame is reserved for the reset position.");

        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (animation) {
                animation.end = label.position - 1;
                this.stopFrames.push(animation.end);
            }
            animation = new Animation();
            animation.movie = this;
            animation.name = label.label;
            animation.start = label.position;
            if (animation.name.toLowerCase().match(" end$")) {
                var sourceAnimation = this.animations[animation.name.substring(0, animation.name.length - 4).toLowerCase()];
                if (sourceAnimation) {
                    // the source animation has a done animation so it is stateful
                    sourceAnimation.endState = sourceAnimation.name.toLowerCase();
                    sourceAnimation.doneAnimation = animation;
                    animation.startState = sourceAnimation.endState;
                }
            }
            else {
                var states = animation.name.split("-");
                if (states.length > 1) {
                    animation.name = states[1];
                    animation.startState = states[0].toLowerCase();
                    animation.endState = states[0].toLowerCase();
                    animation.doneAnimation = this.animations[animation.endState.toLowerCase()].doneAnimation;
                }
                this.animations[animation.name.toLowerCase()] = animation;
            }
        }
        if (animation) {
            animation.end = clip.timeline.duration - 1;
            this.stopFrames.push(animation.end);
        }
    }

    reset = () => {
        return this.animations["reset"].play();
    };

    setResetState(animationName: string) {
        this.animations["reset"].start = this.animations["reset"].end = this.animations[animationName].end;
    }

    handleEndAnimationIfNeeded = () => {
        // at the end of an animation
        if (this.currentAnimation && this.clip.timeline.position == this.currentAnimation.animation.end) {
            // handle repeat logic if there isnt another animation in the queue
            if (this.currentAnimation.shouldRepeat && this.animationQueue.length == 0 && this.currentAnimation.shouldRepeat() && this.currentAnimation.animation.start != this.currentAnimation.animation.end) {
                this.clip.gotoAndPlay(this.currentAnimation.animation.start);
            }
            else {
                this.setState(this.currentAnimation.animation.endState);

                if (this.currentAnimation.doneCallback)
                    this.currentAnimation.doneCallback();

                if (this.animationQueue.length > 0) {
                    this.playNextAnimation();
                }
                else {
                    this.clip.paused = true;
                }
            }
        }
    }

    playNextAnimation = () => {
        if (this.clip.paused || (this.currentAnimation && this.currentAnimation.animation.end == this.clip.timeline.position)) {
            this.currentAnimation = this.animationQueue.shift();
            if (this.currentAnimation != null) {
                // there is a case with the reset animation where change wont get fired if we are already on the reset frame so we need to handle it here
                if (this.currentAnimation.animation.start == this.clip.timeline.position && this.currentAnimation.animation.end == this.clip.timeline.position)
                    // we are already done so move on
                    this.handleEndAnimationIfNeeded();
                else {
                    // start the animation. timeline change handler will handle done
                    this.setState("playing: " + this.currentAnimation.animation.name);
                    this.clip.gotoAndPlay(this.currentAnimation.animation.start);
                }
            }
        }
    };

    private setState(state: string) {
        this.state = state;
        if (this.onStateChanged)
            this.onStateChanged(state);

        if (this.stateChanged)
            this.stateChanged();
    }

    setBitmapImage = (name: string, url: string, sourceRect: createjs.Rectangle = null) => {
        var bm = this.bitmaps[name];
        bm.image = $('<img crossOrigin="Anonymous">').attr({src: url})[0] as HTMLImageElement;

        // set the source rect if needed
        bm.sourceRect = sourceRect;

        $(bm.image).on("load", () => {
            // set by adobe animate
            var bounds = (bm as any).nominalBounds as createjs.Rectangle;
            if (bounds)
                bm.scaleX = bm.scaleY = Math.min(bounds.width / bm.getBounds().width, bounds.height / bm.getBounds().height);
            });
        
    };

    setText = (name: string, text: string) => {
        var txt = this.text[name];
        txt.text = text;
    };

}

class Animation {
    movie: Movie;
    doneAnimation: Animation;
    name: string;
    start: number;
    end: number;
    startState: string = NEUTRAL_STATE;
    endState: string = NEUTRAL_STATE;
     
    play = (shouldRepeat?: () => boolean) => {
        var deffered = $.Deferred<void>();
        // play a transition animation if needed
        var prevAnimation = this.movie.animationQueue.length > 0 ? this.movie.animationQueue[this.movie.animationQueue.length-1] : this.movie.currentAnimation;
        if (prevAnimation
          && prevAnimation.animation.endState != this.startState
          && this.movie.currentAnimation.animation.doneAnimation != null) {
            this.movie.animationQueue.push({ animation: this.movie.currentAnimation.animation.doneAnimation});
        }

        this.movie.animationQueue.push({ animation: this, doneCallback: deffered.resolve, shouldRepeat: shouldRepeat });

        this.movie.playNextAnimation();
        return deffered.promise();
    }
}


interface AnimationEntry {
    animation: Animation;
    doneCallback?: () => void;
    shouldRepeat?: () => boolean;
}