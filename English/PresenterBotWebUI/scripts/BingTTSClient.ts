declare var Howl;

namespace BingTTS {

    export class Client {
        private playing: boolean;
        private context: AudioContext;

        public constructor() {
            try {
                this.context = new AudioContext();
            }
            catch (e) {
                //I know, I know...
            }
        }
         
        private createRequestObject(actionType: string, urlToCall: string): XMLHttpRequest {
            var xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open(actionType, urlToCall,true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("If-Modified-Since", "Sun, 6 Jun 1980 00:00:00 GMT");
            return xhr;
        }

        public makeHttpRequest(xhr: XMLHttpRequest, content: string, resultCallback: (resultText: string, resultError: string) => void): void {

            var responseData = "";
            var requestSucceeded = false;
            var error = "";
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4)
                    if (xhr.status === 200)
                        resultCallback(xhr.responseText, null);
                    else {
                        resultCallback(null, xhr.status + ' ' + xhr.responseText);
                    }
            }
            xhr.send(content);
        }


        public Synthesize(text: string,callback:()=>void) {

            if (this.playing) {
                setTimeout(() => { this.Synthesize(text, callback); }, 100);
                return;
            }

            // Note: The way to get api key:
            // Free: https://www.microsoft.com/cognitive-services/en-us/subscriptions?productId=/products/Bing.Speech.Preview
            // Paid: https://portal.azure.com/#create/Microsoft.CognitiveServices/apitype/Bing.Speech/pricingtier/S0
            var apiKey = "TODO: USE THE KEY FOR YOUR BING SPEECH API CALL HERE";
            var post_data = "";

            var AccessTokenUri = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
            var xhr = this.createRequestObject("POST", "https://api.cognitive.microsoft.com/sts/v1.0/issueToken");
            xhr.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
            this.makeHttpRequest(xhr, "", (resultsText: string, resultsError: string) => {

                var ttsServiceUri = "https://speech.platform.bing.com/synthesize";
                var xhr2 = this.createRequestObject("POST", ttsServiceUri);
                xhr2.setRequestHeader("Content-type", 'application/ssml+xml');
                xhr2.setRequestHeader("X-Microsoft-OutputFormat", 'riff-16khz-16bit-mono-pcm');
                xhr2.setRequestHeader("Authorization", resultsText);
                xhr2.setRequestHeader("X-Search-AppId", '07D3234E49CE426DAA29772419F436CA');
                xhr2.setRequestHeader('X-Search-ClientID', '1ECFAE91408841A480F00935DC390960');
                xhr2.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);

                var data = `<speak version='1.0' xml:lang='en-us'><voice xml:lang='en-uS' xml:gender='Male' name='Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)'>${text}</voice></speak>`;
                xhr2.responseType = 'arraybuffer';

                xhr2.onreadystatechange = () => {
                    if (xhr2.readyState === 4)
                        if (xhr2.status === 200) {

                            var speakerTimer;
                            var waitUntilReady = () => {
                                try {
                                    if (speakerTimer)
                                        clearTimeout(speakerTimer);
                                    if (this.playing) {
                                        speakerTimer = setTimeout(() => { waitUntilReady(); }, 100);
                                    } else {
                                        this.playing = true;
                                        this.context.decodeAudioData(xhr2.response, (buffer) => {
                                            var source = this.context.createBufferSource();
                                            source.buffer = buffer;
                                            source.connect(this.context.destination);

                                            source.start(0);
                                            source.onended = (evt: Event) => {
                                                this.playing = false;
                                                callback();
                                            }

                                        });
                                    }
                                } catch (ex) {
                                    this.playing = false;
                                    callback();
                                }
                            }
                            waitUntilReady();
                        }
                        else {
                            //Not handling errors because courage
                        }
                }
                xhr2.send(data);
            });
        }
    }
   
}