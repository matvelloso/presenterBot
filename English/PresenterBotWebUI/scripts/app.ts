declare var _murphy: any;

class App {
    private appSecret = "TODO: USE THE KEY FROM YOUR BOT FRAMEWORK CONFIGURATION FOR DIRECT LINE CHANNEL HERE";
    private client: DirectLine.Client;
    private txtInput: HTMLInputElement;
    private chatWindow: HTMLDivElement;
    private userid: string;
    private bingTTSClient: BingTTS.Client;
    private renderingXMLCard = false;

    public run(): void {
        this.bingTTSClient = new BingTTS.Client();

        this.userid = Math.random().toString();
        this.client = new DirectLine.Client((messages: DirectLine.DLMessageGroup, done: () => void) => {

            this.messagesReceivedCallback(messages, done);
        });

        this.txtInput = <HTMLInputElement>document.getElementById("txtInput");
        this.chatWindow = <HTMLDivElement>document.getElementById("chat");
        this.txtInput.addEventListener("keydown", (evt: KeyboardEvent) => { return this.inputKeyDown(evt); });
        this.client.startConversation(this.appSecret, (result, error) => {

             
        });
    }

    public inputKeyDown(evt: KeyboardEvent): boolean {
        if (evt.keyCode === 13 && this.client.getStatus() === "ONLINE") {
            this.client.postMessage(this.txtInput.value, this.userid);
            this.txtInput.value = "";
            return false;

        } else
            return true;
    }

    public renderXMLCard(card: Document, count?: number): void {
        if (this.renderingXMLCard) {
            setTimeout(() => {
                this.renderXMLCard(card, count);
            }, 100);
            return;
        }
        this.renderingXMLCard = true;
        if (!count) count = 0;

        var render = (card: Document, count?: number) => {
            if (count == 0 && card.documentElement.hasAttribute("clearScreen") && card.documentElement.attributes.getNamedItem("clearScreen").value == "true") {
                this.chatWindow.innerHTML = "";
            }
            if (count < card.documentElement.childNodes.length) {
                var element = card.documentElement.childNodes[count];
                var elementType = element.nodeName;
                switch (elementType) {
                    case "label":
                        this.showBotText(element.childNodes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "link":
                        this.showBotLink(element.childNodes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "image":
                        this.showBotImage(element.childNodes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "iframe":
                        this.showBotIframe(element.childNodes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "list":
                        this.showBotList(element, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "music":
                        this.playMusic(element.childNodes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    case "animation":
                        this.animateBot(element.attributes[0].nodeValue, () => {
                            count++;
                            render(card, count);
                        });
                        break;
                    default:
                        count++;
                       render(card, count);
                        break;
                }
            } else {
                this.renderingXMLCard = false;
            }
        }
        render(card, count);

    }

    private scrollToBottom(): void {
        var e = <HTMLHtmlElement>this.chatWindow.children[this.chatWindow.children.length - 1];
        if (!!e && e.scrollIntoView) {
            e.scrollIntoView();
        }
    }

    public animateBot(animation: string, callback: () => void): void {
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
    }

    public showBotImage(url: string, callback: () => void): void {
        setTimeout(() => {
            var img = document.createElement("img");
            img.className = "chatImage";
            img.src = url;
            this.chatWindow.appendChild(img);
            this.scrollToBottom();
            callback();
        }, 0);
    }

    public showBotIframe(url: string, callback: () => void): void {
        setTimeout(() => {
            var iframe = document.createElement("iframe");
            iframe.style.width = "800px";
            iframe.style.height="600px;";
            iframe.src = url;
            this.chatWindow.appendChild(iframe);
            this.scrollToBottom();
            callback();
        }, 0);
    }

    public showBotLink(link: string, callback: () => void): void {
        setTimeout(() => {
            var div = document.createElement("div");
            var href = document.createElement("a");
            href.href = link;
            href.innerText = link;
            div.innerHTML = '<b>presenterbot:</b> ';
            div.appendChild(href);
            div.innerHTML+="<br/>";
            this.chatWindow.appendChild(div);
            this.scrollToBottom();
            callback();
        }, 0);
    }
    public showBotText(text: string, callback: () => void): void{
        setTimeout(() => {
            var div = document.createElement("div");
            div.innerHTML = `<b>presenterbot:</b> ${text}<br/>`;
            this.chatWindow.appendChild(div);
            this.scrollToBottom();
        }, 0);
        this.bingTTSClient.Synthesize(text, callback);
    }

    public playMusic(url: string, callback: () => void): void {
        var audio = new Audio(url);
        audio.volume = 0.4;
        audio.play();
        callback();
    }

    public openBulletList(): void {
        this.chatWindow.innerHTML += `<ul type="disc">`;
        this.scrollToBottom();
    }

    public closeBulletList(): void {
        setTimeout(() => {
            this.chatWindow.innerHTML += `</ul>`;
            this.scrollToBottom();
        }, 0);
    }
    public showBullet(text: string, callback: () => void): void {
        setTimeout(() => {
            this.chatWindow.innerHTML += `<li>${text}</li>`;
            this.scrollToBottom();
        }, 0);
        this.bingTTSClient.Synthesize(text, callback);
    }

    public showBotList(list: Node, callback: () => void): void {
    
        var count = 0;
        var iterate = () => {
            if (count == 0) this.openBulletList();
            if (count < list.childNodes.length) {               
                if (list.childNodes[count].nodeName == "listItem") {
                    this.showBullet(list.childNodes[count].childNodes[0].nodeValue, () => {
                        count++;
                        iterate();
                    });
                } else {
                    count++;
                    iterate();
                }
            } else {
                this.closeBulletList();
                callback();
            }
        }

        iterate();
    }

    public messagesReceivedCallback(messages: DirectLine.DLMessageGroup, done: () =>void, count?: number): void {
        if (!count) count = 0;

        if (count < messages.messages.length) {
            var from = (messages.messages[count].from == "presenterbot") ? "presenterBot" : "me";
            if (from == "presenterBot") {
                if (messages.messages[count].text == "Custom Data") {
                    var parsedData = new DOMParser().parseFromString(<string>(messages.messages[count].channelData.data), "text/xml");
                    this.renderXMLCard(parsedData);
                    count++;
                    this.messagesReceivedCallback(messages, done, count);

                } else {
                    this.showBotText(messages.messages[count].text, () => {
                        count++;
                        this.messagesReceivedCallback(messages, done, count);
                    });
                }
            }
            else {
                var div = document.createElement("div");
                div.innerHTML = `<div><b>${from}:</b> ${messages.messages[count].text}</div><br/>`;
                this.chatWindow.appendChild(div);
                count++;
                this.messagesReceivedCallback(messages, done, count);

            }

        } else {
            done();
        }
    }
}

var app: App;

window.onload= ()=>{ 
    app = new App();
    app.run();
}