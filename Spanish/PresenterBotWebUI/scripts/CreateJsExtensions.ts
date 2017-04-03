
declare namespace createjs {
    interface Tween {
        callWait(callback: () => JQueryPromise<any>): Tween;
        waitFor(operation: JQueryPromise<any>): Tween;
    }
}

// add a tween method to call a function and wait for a promise object
createjs.Tween.prototype.callWait = function (callback) {
    var tween = this as createjs.Tween;
    var newTween = createjs.Tween.get(tween.target, {paused: true})

    tween.call(() => { 
        callback().always(()=> newTween.setPaused(false));
        });
    return newTween;
};
 
createjs.Tween.prototype.waitFor = function (operation: JQueryPromise<any>) {
    var tween = this as createjs.Tween;
    return tween.callWait(() => operation);
};

