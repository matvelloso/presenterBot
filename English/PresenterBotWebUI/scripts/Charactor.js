/// <reference path="./typings/createjs/createjs.d.ts" />
/// <reference path="./typings/jquery/jquery.d.ts" />
function getAllValues(dictionary) {
    var result = [];
    for (var p in dictionary) {
        result.push(dictionary[p]);
    }
    return result;
}
var Charactor = (function () {
    function Charactor(stage) {
        var _this = this;
        this.movies = [];
        this.moviesByName = {};
        this.reset = function (animationOrMovieName) {
            // reset only a specific animation
            if (animationOrMovieName) {
                var anim = _this.getAnimation(animationOrMovieName);
                if (anim)
                    return anim.movie.reset();
                var movie = _this.moviesByName[animationOrMovieName];
                if (movie)
                    return movie.reset();
            }
            else
                // reset everything;
                return $.when(_this.movies.map(function (m) { return m.reset(); }));
        };
        this.setStartState = function (state) {
            // right now we assume the state is the same as the animation name
            var anim = _this.getAnimation(state);
            if (anim) {
                anim.movie.currentAnimation = { animation: anim };
                anim.movie.clip.gotoAndStop(anim.end);
                anim.movie.state = state.toLowerCase();
            }
        };
        this.animate = function (target) {
            if (target === void 0) { target = _this.stage; }
            return createjs.Tween.get(target, { override: false });
        };
        this.setBitmapImage = function (name, url, sourceRect) {
            if (sourceRect === void 0) { sourceRect = null; }
            var deferred = $.Deferred();
            var img = images[name];
            var bmps = img.instances;
            img.src = url;
            bmps.forEach(function (bm) {
                // set the source rect if needed
                bm.sourceRect = sourceRect;
                $(img).on("load", function () {
                    // set by adobe animate
                    var bounds = bm.nominalBounds;
                    if (bounds)
                        bm.scaleX = bm.scaleY = Math.min(bounds.width / bm.getBounds().width, bounds.height / bm.getBounds().height);
                    deferred.resolve();
                });
            });
            return deferred.promise();
        };
        this.stage = stage;
        this.rootClip = stage.children[0];
        var recurse = function (parent, path, clip, movie) {
            // set the charactor reference for use by the action script
            clip.charactor = _this;
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
                _this.movies.push(movie);
                _this.moviesByName[movie.name] = movie;
            }
            for (var i = 0; i < clip.children.length; i++) {
                var mc = clip.children[i];
                if (mc instanceof createjs.MovieClip)
                    recurse(clip, path + name + (path + name ? "." : ""), mc, movie);
            }
            // look for children recursivly
            for (var p in clip) {
                var mc = clip[p];
                var bmp = clip[p];
                var fullname = path + name;
                if (mc instanceof createjs.MovieClip && mc != clip.parent) {
                    if (clip.children.indexOf(mc) < 0)
                        recurse(clip, fullname + (fullname ? "." : ""), mc, movie);
                }
                else if (bmp instanceof createjs.Bitmap) {
                    var bi = bmp.image.instances = bmp.image.instances || [];
                    bi.push(bmp);
                    movie.bitmaps[fullname.substring(movie.name ? movie.name.length + 1 : 0)] = bmp;
                }
                else if (movie && clip[p] instanceof createjs.Text)
                    movie.text[(fullname + "." + p).substring(movie.name ? movie.name.length + 1 : 0)] = clip[p];
            }
        };
        var getPropName = function (parent, clip) {
            for (var p in parent) {
                if (parent[p] === clip)
                    return p;
            }
            return "";
        };
        recurse(null, "", this.rootClip, null);
    }
    Charactor.prototype.getAnimation = function (animationName, movieName) {
        if (movieName === void 0) { movieName = null; }
        var anims = [];
        this.movies.forEach(function (m) {
            var anim = m.animations[animationName.toLowerCase()];
            if (anim)
                anims.push(anim);
        });
        if (anims.length == 1)
            return anims[0];
        else if (anims.length > 1 && movieName)
            for (var i = 0; i < anims.length; i++)
                if (new RegExp(movieName + "$").test(anims[i].movie.name))
                    return anims[i];
        return null;
    };
    Charactor.prototype.play = function (animationName, movieName, shouldRepeat) {
        if (movieName === void 0) { movieName = null; }
        var anim = this.getAnimation(animationName, movieName);
        if (anim)
            return anim.play(shouldRepeat);
    };
    Charactor.prototype.playLoop = function (animationName, parentClip) {
        // find the movie for the clip
        var movie;
        for (var i = 0; i < this.movies.length; i++)
            if (this.movies[i].clip === parentClip)
                movie = this.movies[i];
        if (movie) {
            var loopState = movie.currentAnimation.animation.endState;
            var anim = this.getAnimation(animationName);
            if (anim)
                anim.play(function () { return movie.state == loopState; });
        }
    };
    return Charactor;
}());
var NEUTRAL_STATE = "neutral";
var Movie = (function () {
    function Movie(clip, name) {
        var _this = this;
        this.animations = {};
        this.animationQueue = [];
        this.stopFrames = [0];
        this.bitmaps = {};
        this.text = {};
        this.state = NEUTRAL_STATE;
        this.reset = function () {
            return _this.animations["reset"].play();
        };
        this.handleEndAnimationIfNeeded = function () {
            // at the end of an animation
            if (_this.currentAnimation && _this.clip.timeline.position == _this.currentAnimation.animation.end) {
                // handle repeat logic if there isnt another animation in the queue
                if (_this.currentAnimation.shouldRepeat && _this.animationQueue.length == 0 && _this.currentAnimation.shouldRepeat() && _this.currentAnimation.animation.start != _this.currentAnimation.animation.end) {
                    _this.clip.gotoAndPlay(_this.currentAnimation.animation.start);
                }
                else {
                    _this.setState(_this.currentAnimation.animation.endState);
                    if (_this.currentAnimation.doneCallback)
                        _this.currentAnimation.doneCallback();
                    if (_this.animationQueue.length > 0) {
                        _this.playNextAnimation();
                    }
                    else {
                        _this.clip.paused = true;
                    }
                }
            }
        };
        this.playNextAnimation = function () {
            if (_this.clip.paused || (_this.currentAnimation && _this.currentAnimation.animation.end == _this.clip.timeline.position)) {
                _this.currentAnimation = _this.animationQueue.shift();
                if (_this.currentAnimation != null) {
                    // there is a case with the reset animation where change wont get fired if we are already on the reset frame so we need to handle it here
                    if (_this.currentAnimation.animation.start == _this.clip.timeline.position && _this.currentAnimation.animation.end == _this.clip.timeline.position)
                        // we are already done so move on
                        _this.handleEndAnimationIfNeeded();
                    else {
                        // start the animation. timeline change handler will handle done
                        _this.setState("playing: " + _this.currentAnimation.animation.name);
                        _this.clip.gotoAndPlay(_this.currentAnimation.animation.start);
                    }
                }
            }
        };
        this.setBitmapImage = function (name, url, sourceRect) {
            if (sourceRect === void 0) { sourceRect = null; }
            var bm = _this.bitmaps[name];
            bm.image = $('<img crossOrigin="Anonymous">').attr({ src: url })[0];
            // set the source rect if needed
            bm.sourceRect = sourceRect;
            $(bm.image).on("load", function () {
                // set by adobe animate
                var bounds = bm.nominalBounds;
                if (bounds)
                    bm.scaleX = bm.scaleY = Math.min(bounds.width / bm.getBounds().width, bounds.height / bm.getBounds().height);
            });
        };
        this.setText = function (name, text) {
            var txt = _this.text[name];
            txt.text = text;
        };
        this.clip = clip;
        this.name = name;
        clip.loop = false;
        clip.timeline.on("change", function () {
            // always stop on the first frame
            if (_this.stopFrames.indexOf(_this.clip.timeline.position) > -1)
                _this.clip.paused = true;
            _this.handleEndAnimationIfNeeded();
        });
        // add all the animations from stop frames
        var animation;
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
    Movie.prototype.setResetState = function (animationName) {
        this.animations["reset"].start = this.animations["reset"].end = this.animations[animationName].end;
    };
    Movie.prototype.setState = function (state) {
        this.state = state;
        if (this.onStateChanged)
            this.onStateChanged(state);
        if (this.stateChanged)
            this.stateChanged();
    };
    return Movie;
}());
var Animation = (function () {
    function Animation() {
        var _this = this;
        this.startState = NEUTRAL_STATE;
        this.endState = NEUTRAL_STATE;
        this.play = function (shouldRepeat) {
            var deffered = $.Deferred();
            // play a transition animation if needed
            var prevAnimation = _this.movie.animationQueue.length > 0 ? _this.movie.animationQueue[_this.movie.animationQueue.length - 1] : _this.movie.currentAnimation;
            if (prevAnimation
                && prevAnimation.animation.endState != _this.startState
                && _this.movie.currentAnimation.animation.doneAnimation != null) {
                _this.movie.animationQueue.push({ animation: _this.movie.currentAnimation.animation.doneAnimation });
            }
            _this.movie.animationQueue.push({ animation: _this, doneCallback: deffered.resolve, shouldRepeat: shouldRepeat });
            _this.movie.playNextAnimation();
            return deffered.promise();
        };
    }
    return Animation;
}());
//# sourceMappingURL=Charactor.js.map