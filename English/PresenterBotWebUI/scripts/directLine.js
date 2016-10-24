var DirectLine;
(function (DirectLine) {
    //Shamelesly stolen half of this code from Bill Barnes
    var domain = "https://directline.botframework.com";
    var baseUrl = domain + "/api/conversations";
    var Client = (function () {
        function Client(messagesReceivedCallback) {
            this.status = "OFFLINE";
            this.messagesReceivedCallback = messagesReceivedCallback;
        }
        Client.prototype.getStatus = function () {
            return this.status;
        };
        Client.prototype.getCurrentConversatoin = function () {
            return this.currentConversation;
        };
        Client.prototype.createRequestObject = function (actionType, urlToCall, accept, authorization) {
            var xhr = new XMLHttpRequest();
            xhr.open(actionType, urlToCall, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("If-Modified-Since", "Sun, 6 Jun 1980 00:00:00 GMT");
            xhr.setRequestHeader("Accept", accept);
            xhr.setRequestHeader("Authorization", authorization);
            if (actionType == "POST")
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
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
                    else
                        resultCallback(null, xhr.status + ' ' + xhr.responseText);
            };
            xhr.send(content);
        };
        Client.prototype.startConversation = function (appSecret, resultCallback) {
            var _this = this;
            this.appSecret = appSecret;
            var xhr = this.createRequestObject("POST", "" + baseUrl, "application/json", "BotConnector " + appSecret);
            this.makeHttpRequest(xhr, "", function (resultText, resultError) {
                if (resultText) {
                    _this.currentConversation = JSON.parse(resultText);
                    _this.status = "ONLINE";
                    _this.timer = window.setTimeout(function () { _this.QueryMessages(); }, 1000);
                    resultCallback(_this.currentConversation, null);
                }
                else {
                    _this.status = "OFFLINE";
                    resultCallback(null, resultError);
                }
            });
        };
        Client.prototype.QueryMessages = function () {
            this.getActivities(this.messagesReceivedCallback);
        };
        Client.prototype.postMessage = function (text, userId) {
            var xhr = this.createRequestObject("POST", baseUrl + "/" + this.currentConversation.conversationId + "/messages", "application/json", "BotConnector " + this.appSecret);
            var message = {
                text: text,
                from: userId,
                conversationId: this.currentConversation.conversationId
            };
            this.makeHttpRequest(xhr, JSON.stringify(message), function (resultText, resultError) {
            });
        };
        Client.prototype.getActivities = function (resultCallback) {
            var _this = this;
            window.clearTimeout(this.timer);
            var url = baseUrl + "/" + this.currentConversation.conversationId + "/messages";
            if (this.currentWatermark)
                url += "?watermark=" + this.currentWatermark;
            var xhr = this.createRequestObject("GET", url, "application/json", "BotConnector " + this.appSecret);
            this.makeHttpRequest(xhr, "", function (resultText, resultError) {
                if (resultText) {
                    var messageGroup = JSON.parse(resultText);
                    _this.currentWatermark = messageGroup.watermark;
                    resultCallback(JSON.parse(resultText), function () {
                        _this.timer = window.setTimeout(function () { _this.QueryMessages(); }, 1000);
                    });
                }
                else {
                    resultCallback(null, function () {
                        _this.timer = window.setTimeout(function () { _this.QueryMessages(); }, 1000);
                    });
                }
            });
        };
        return Client;
    }());
    DirectLine.Client = Client;
})(DirectLine || (DirectLine = {}));
//# sourceMappingURL=directLine.js.map