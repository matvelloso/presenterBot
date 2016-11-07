declare namespace createjs {
    interface Tween {
        callWait(callback: () => JQueryPromise<any>): Tween;
        waitFor(operation: JQueryPromise<any>): Tween;
    }
}
