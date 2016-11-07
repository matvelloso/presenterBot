declare var Howl: any;
declare namespace BingTTS {
    class Client {
        private playing;
        private context;
        constructor();
        private createRequestObject(actionType, urlToCall);
        makeHttpRequest(xhr: XMLHttpRequest, content: string, resultCallback: (resultText: string, resultError: string) => void): void;
        Synthesize(text: string, callback: () => void): void;
    }
}
