var App = (function () {
    function App() {
        this.appSecret = "COLOQUE O SERET TO DIRECT LINE DO SEU BOT AQUI";
        this.renderingXMLCard = false;
    }
    App.prototype.run = function () {
        var _this = this;
        this.bingTTSClient = new BingTTS.Client();
        this.userid = Math.random().toString();
        this.client = new DirectLine.Client(function (messages, done) {
            _this.messagesReceivedCallback(messages, done);
        });
        this.txtInput = document.getElementById("txtInput");
        this.chatWindow = document.getElementById("chat");
        this.txtInput.addEventListener("keydown", function (evt) { return _this.inputKeyDown(evt); });
        this.client.startConversation(this.appSecret, function (result, error) {
        });
    };
    App.prototype.inputKeyDown = function (evt) {
        if (evt.keyCode === 13 && this.client.getStatus() === "ONLINE") {
            this.client.postMessage(this.txtInput.value, this.userid);
            this.txtInput.value = "";
            return false;
        }
        else
            return true;
    };
    App.prototype.renderXMLCard = function (card, count) {
        var _this = this;
        if (this.renderingXMLCard) {
            setTimeout(function () {
                _this.renderXMLCard(card, count);
            }, 100);
            return;
        }
        this.renderingXMLCard = true;
        if (!count)
            count = 0;
        var render = function (card, count) {
            if (count == 0 && card.documentElement.hasAttribute("clearScreen") && card.documentElement.attributes.getNamedItem("clearScreen").value == "true") {
                _this.chatWindow.innerHTML = "";
            }
            if (count < card.documentElement.childNodes.length) {
                var element = card.documentElement.childNodes[count];
                var elementType = element.nodeName;
                switch (elementType) {
                    case "label":
                        _this.showBotText(element.childNodes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "link":
                        _this.showBotLink(element.childNodes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "image":
                        _this.showBotImage(element.childNodes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "iframe":
                        _this.showBotIframe(element.childNodes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "list":
                        _this.showBotList(element, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "music":
                        _this.playMusic(element.childNodes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "animation":
                        _this.animateBot(element.attributes[0].nodeValue, function () {
                            count++;
                            render(card, count);
                        });
                        break;
                    default:
                        count++;
                        render(card, count);
                        break;
                }
            }
            else {
                _this.renderingXMLCard = false;
            }
        };
        render(card, count);
    };
    App.prototype.scrollToBottom = function () {
        var e = this.chatWindow.children[this.chatWindow.children.length - 1];
        if (!!e && e.scrollIntoView) {
            e.scrollIntoView();
        }
    };
    App.prototype.animateBot = function (animation, callback) {
        switch (animation) {
            case "thinking":
                _murphy.reset("leave");
                _murphy.play("Murphy thinking");
                break;
            case "thinking_end":
                _murphy.reset("Murphy thinking");
                break;
            case "enter":
                _murphy.reset("leave");
                break;
            case "shrug":
                _murphy.reset("leave");
                _murphy.play("Murphy shrug");
                break;
            case "head_bump":
                _murphy.reset("leave");
                _murphy.play("Head bump");
                break;
            case "got_it":
                _murphy.play("Murphy got it");
                break;
            case "got_it_end":
                _murphy.reset("Murphy got it");
                break;
            case "smile":
                _murphy.reset("leave");
                _murphy.play("smile");
                break;
            case "smile_end":
                _murphy.reset("smile");
                break;
            case "frown":
                _murphy.play("frown");
                break;
            case "dance":
                _murphy.play("dance");
                break;
            case "dance_end":
                _murphy.reset("dance");
                break;
            case "frown_end":
                _murphy.reset("frown");
                break;
            case "wave_flag":
                _murphy.reset("leave");
                _murphy.play("wave flag");
                break;
            case "wave_flag_end":
                _murphy.reset("wave flag");
                break;
            case "antenna_glow":
                _murphy.play("antenna glow");
                _murphy.reset("leave");
            default:
                break;
        }
        callback();
    };
    App.prototype.showBotImage = function (url, callback) {
        var _this = this;
        setTimeout(function () {
            var img = document.createElement("img");
            img.className = "chatImage";
            img.src = url;
            _this.chatWindow.appendChild(img);
            _this.scrollToBottom();
            callback();
        }, 0);
    };
    App.prototype.showBotIframe = function (url, callback) {
        var _this = this;
        setTimeout(function () {
            var iframe = document.createElement("iframe");
            iframe.style.width = "800px";
            iframe.style.height = "600px;";
            iframe.src = url;
            _this.chatWindow.appendChild(iframe);
            _this.scrollToBottom();
            callback();
        }, 0);
    };
    App.prototype.showBotLink = function (link, callback) {
        var _this = this;
        setTimeout(function () {
            var div = document.createElement("div");
            var href = document.createElement("a");
            href.href = link;
            href.innerText = link;
            div.innerHTML = '<b>presenterbot:</b> ';
            div.appendChild(href);
            div.innerHTML += "<br/>";
            _this.chatWindow.appendChild(div);
            _this.scrollToBottom();
            callback();
        }, 0);
    };
    App.prototype.showBotText = function (text, callback) {
        var _this = this;
        setTimeout(function () {
            var div = document.createElement("div");
            div.innerHTML = "<b>presenterbot:</b> " + text + "<br/>";
            _this.chatWindow.appendChild(div);
            _this.scrollToBottom();
        }, 0);
        this.bingTTSClient.Synthesize(text, callback);
    };
    App.prototype.playMusic = function (url, callback) {
        var audio = new Audio(url);
        audio.volume = 0.4;
        audio.play();
        callback();
    };
    App.prototype.openBulletList = function () {
        this.chatWindow.innerHTML += "<ul type=\"disc\">";
        this.scrollToBottom();
    };
    App.prototype.closeBulletList = function () {
        var _this = this;
        setTimeout(function () {
            _this.chatWindow.innerHTML += "</ul>";
            _this.scrollToBottom();
        }, 0);
    };
    App.prototype.showBullet = function (text, callback) {
        var _this = this;
        setTimeout(function () {
            _this.chatWindow.innerHTML += "<li>" + text + "</li>";
            _this.scrollToBottom();
        }, 0);
        this.bingTTSClient.Synthesize(text, callback);
    };
    App.prototype.showBotList = function (list, callback) {
        var _this = this;
        var count = 0;
        var iterate = function () {
            if (count == 0)
                _this.openBulletList();
            if (count < list.childNodes.length) {
                if (list.childNodes[count].nodeName == "listItem") {
                    _this.showBullet(list.childNodes[count].childNodes[0].nodeValue, function () {
                        count++;
                        iterate();
                    });
                }
                else {
                    count++;
                    iterate();
                }
            }
            else {
                _this.closeBulletList();
                callback();
            }
        };
        iterate();
    };
    App.prototype.messagesReceivedCallback = function (messages, done, count) {
        var _this = this;
        if (!count)
            count = 0;
        if (count < messages.messages.length) {
            var from = (messages.messages[count].from == "presenterbotbr") ? "presenterBotBR" : "me";
            if (from == "presenterBotBR") {
                if (messages.messages[count].text == "Custom Data") {
                    var parsedData = new DOMParser().parseFromString((messages.messages[count].channelData.data), "text/xml");
                    this.renderXMLCard(parsedData);
                    count++;
                    this.messagesReceivedCallback(messages, done, count);
                }
                else {
                    this.showBotText(messages.messages[count].text, function () {
                        count++;
                        _this.messagesReceivedCallback(messages, done, count);
                    });
                }
            }
            else {
                var div = document.createElement("div");
                div.innerHTML = "<div><b>" + from + ":</b> " + messages.messages[count].text + "</div><br/>";
                this.chatWindow.appendChild(div);
                count++;
                this.messagesReceivedCallback(messages, done, count);
            }
        }
        else {
            done();
        }
    };
    return App;
}());
var app;
window.onload = function () {
    app = new App();
    app.run();
};
//# sourceMappingURL=app.js.map