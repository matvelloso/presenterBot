// add a tween method to call a function and wait for a promise object
createjs.Tween.prototype.callWait = function (callback) {
    var tween = this;
    var newTween = createjs.Tween.get(tween.target, { paused: true });
    tween.call(function () {
        callback().always(function () { return newTween.setPaused(false); });
    });
    return newTween;
};
createjs.Tween.prototype.waitFor = function (operation) {
    var tween = this;
    return tween.callWait(function () { return operation; });
};
//# sourceMappingURL=CreateJsExtensions.js.map