var BingTTS;
(function (BingTTS) {
    var Client = (function () {
        function Client() {
            try {
                this.context = new AudioContext();
            }
            catch (e) {
            }
        }
        Client.prototype.createRequestObject = function (actionType, urlToCall) {
            var xhr = new XMLHttpRequest();
            xhr.open(actionType, urlToCall, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("If-Modified-Since", "Sun, 6 Jun 1980 00:00:00 GMT");
            return xhr;
        };
        Client.prototype.makeHttpRequest = function (xhr, content, resultCallback) {
            var responseData = "";
            var requestSucceeded = false;
            var error = "";
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4)
                    if (xhr.status === 200)
                        resultCallback(xhr.responseText, null);
                    else {
                        resultCallback(null, xhr.status + ' ' + xhr.responseText);
                    }
            };
            xhr.send(content);
        };
        Client.prototype.Synthesize = function (text, callback) {
            var _this = this;
            if (this.playing) {
                setTimeout(function () { _this.Synthesize(text, callback); }, 100);
                return;
            }
            // Note: The way to get api key:
            // Free: https://www.microsoft.com/cognitive-services/en-us/subscriptions?productId=/products/Bing.Speech.Preview
            // Paid: https://portal.azure.com/#create/Microsoft.CognitiveServices/apitype/Bing.Speech/pricingtier/S0
            var apiKey = "YOUR_BING_SPEECH_API_KEY";
            var post_data = "";
            var AccessTokenUri = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
            var xhr = this.createRequestObject("POST", "https://api.cognitive.microsoft.com/sts/v1.0/issueToken");
            xhr.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
            this.makeHttpRequest(xhr, "", function (resultsText, resultsError) {
                var ttsServiceUri = "https://speech.platform.bing.com/synthesize";
                var xhr2 = _this.createRequestObject("POST", ttsServiceUri);
                xhr2.setRequestHeader("Content-type", 'application/ssml+xml');
                xhr2.setRequestHeader("X-Microsoft-OutputFormat", 'riff-16khz-16bit-mono-pcm');
                xhr2.setRequestHeader("Authorization", resultsText);
                xhr2.setRequestHeader("X-Search-AppId", '07D3234E49CE426DAA29772419F436CA');
                xhr2.setRequestHeader('X-Search-ClientID', '1ECFAE91408841A480F00935DC390960');
                xhr2.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
                var data = "<speak version='1.0' xml:lang='en-us'><voice xml:lang='en-uS' xml:gender='Male' name='Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)'>" + text + "</voice></speak>";
                xhr2.responseType = 'arraybuffer';
                xhr2.onreadystatechange = function () {
                    if (xhr2.readyState === 4)
                        if (xhr2.status === 200) {
                            var speakerTimer;
                            var waitUntilReady = function () {
                                try {
                                    if (speakerTimer)
                                        clearTimeout(speakerTimer);
                                    if (_this.playing) {
                                        speakerTimer = setTimeout(function () { waitUntilReady(); }, 100);
                                    }
                                    else {
                                        _this.playing = true;
                                        _this.context.decodeAudioData(xhr2.response, function (buffer) {
                                            var source = _this.context.createBufferSource();
                                            source.buffer = buffer;
                                            source.connect(_this.context.destination);
                                            source.start(0);
                                            source.onended = function (evt) {
                                                _this.playing = false;
                                                callback();
                                            };
                                        });
                                    }
                                }
                                catch (ex) {
                                    _this.playing = false;
                                    callback();
                                }
                            };
                            waitUntilReady();
                        }
                        else {
                        }
                };
                xhr2.send(data);
            });
        };
        return Client;
    }());
    BingTTS.Client = Client;
})(BingTTS || (BingTTS = {}));
//# sourceMappingURL=BingTTSClient.js.map