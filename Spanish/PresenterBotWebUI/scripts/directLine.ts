namespace DirectLine {
    //Shamelesly stolen half of this code from Bill Barnes

    const domain = "https://directline.botframework.com";
    const baseUrl = `${domain}/api/conversations`;

    export interface Conversation {
        conversationId: string,
        token: string, 
        eTag?: string,
        streamUrl?: string
    }

    export interface Image {
        contentType: "image/png" | "image/jpg" | "image/jpeg",
        contentUrl: string,
        name?: string
    }

    export interface Button {
        type: "imBack" | "postBack" | "openUrl" | "signin",
        title: string,
        value: string
        image?: string,
    }

    export interface HeroCard {
        contentType: "application/vnd.microsoft.card.hero",
        content: {
            title?: string,
            subtitle?: string,
            text?: string,
            images?: { url: string }[],
            buttons?: Button[]
        }
    }

    export interface Thumbnail {
        contentType: "application/vnd.microsoft.card.thumbnail",
        content: {
            title?: string,
            subtitle?: string,
            text?: string,
            images?: { url: string }[],
            buttons?: Button[]
            tap: string
        }
    }

    export interface Signin {
        contentType: "application/vnd.microsoft.card.signin",
        content: {
            text?: string,
            buttons?: Button[]
        }
    }

    export interface ReceiptItem {
        title?: string,
        subtitle?: string,
        text?: string,
        image?: { url: string },
        price?: string,
        quantity?: string,
        tap?: string
    }

    export interface Receipt {
        contentType: "application/vnd.microsoft.card.receipt",
        content: {
            title?: string,
            facts?: { key: string, value: string }[],
            items?: ReceiptItem[],
            tap?: string,
            tax?: string,
            VAT?: string,
            total?: string,
            buttons?: Button[]
        }
    }

    export type Attachment = Image | HeroCard | Thumbnail | Signin | Receipt;

    export interface Message {
        type: "message",
        id?: string,
        conversation?: { id: string },
        timestamp?: string,
        from?: { id: string },
        text?: string,
        local?: string,
        textFormat?: "plain" | "markdown" | "xml",
        channelData?: any,
        attachmentLayout?: "list" | "carousel",
        attachments?: Attachment[],
        eTag?: string,
        channelId?: string,
        entities?: any[]
    }

    export interface Typing {
        type: "typing"
    }

    export type Activity = Message | Typing;

    export interface DLAttachment {
        url: string,
        contentType: string
    }

    export interface DLMessage {
        id?: string,
        conversationId?: string,
        created?: string,
        from?: string,
        text?: string,
        channelData?: any,
        images?: string[],
        attachments?: DLAttachment[];
        eTag?: string;
    }

    export interface DLMessageGroup {
        messages: DLMessage[],
        watermark?: string,
        eTag?: string
    }

    export class Client {

        private status = "OFFLINE";
        private currentConversation: Conversation;
        private appSecret: string;
        private currentWatermark: string;
        private messagesReceivedCallback: (messages: DLMessageGroup, done:()=>void) => void;
        private timer: number;
        public constructor(messagesReceivedCallback: (messages: DLMessageGroup, done: () => void) => void) {
            this.messagesReceivedCallback = messagesReceivedCallback;
            
        }

        public getStatus() {
            return this.status;
        }

        public getCurrentConversatoin() {
            return this.currentConversation;
        }

        private createRequestObject(actionType: string, urlToCall: string, accept: string, authorization: string): XMLHttpRequest {
            var xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open(actionType, urlToCall,true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("If-Modified-Since", "Sun, 6 Jun 1980 00:00:00 GMT");
            xhr.setRequestHeader("Accept", accept);
            xhr.setRequestHeader("Authorization", authorization);
            if (actionType == "POST")
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

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
                    else
                        resultCallback(null, xhr.status + ' ' + xhr.responseText);
            }
            xhr.send(content);
        }

        public startConversation(appSecret: string, resultCallback: (conversation: Conversation, resultError: string) => void) {
            this.appSecret = appSecret;
            var xhr = this.createRequestObject("POST", `${baseUrl}`, "application/json", `BotConnector ${appSecret}`);

            this.makeHttpRequest(xhr, "", (resultText: string, resultError: string) => {
                if (resultText) {
                    this.currentConversation = <Conversation>JSON.parse(resultText);
                    this.status = "ONLINE";
                    this.timer = window.setTimeout(() => { this.QueryMessages(); }, 1000);

                    resultCallback(this.currentConversation, null);
                }
                else {
                    this.status = "OFFLINE";
                    resultCallback(null, resultError);
                }
            });

        }
        private QueryMessages() {
            this.getActivities(this.messagesReceivedCallback);
        }

        public postMessage(text: string, userId: string) {
            var xhr = this.createRequestObject("POST", `${baseUrl}/${this.currentConversation.conversationId}/messages`, "application/json", `BotConnector ${this.appSecret}`);

            var message = <DLMessage>{ 
                text: text,
                from: userId,
                conversationId: this.currentConversation.conversationId
            };

            this.makeHttpRequest(xhr, JSON.stringify(message), (resultText: string, resultError: string) => {

            });
        }

        private getActivities(resultCallback: (messageGroup: DLMessageGroup, done: ()=>void) => void) {
            window.clearTimeout(this.timer);
            var url = `${baseUrl}/${this.currentConversation.conversationId}/messages`;
            if (this.currentWatermark)
                url += `?watermark=${this.currentWatermark}`;
            var xhr = this.createRequestObject("GET", url, "application/json", `BotConnector ${this.appSecret}`);

            this.makeHttpRequest(xhr, "", (resultText: string, resultError: string) => {
                if (resultText) {
                    var messageGroup = <DLMessageGroup>JSON.parse(resultText);
                    this.currentWatermark = messageGroup.watermark;
                    resultCallback(<DLMessageGroup>JSON.parse(resultText), () => {
                        this.timer = window.setTimeout(() => { this.QueryMessages(); }, 1000);
                    });
                }
                else {
                    resultCallback(null, () => {
                        this.timer = window.setTimeout(() => { this.QueryMessages(); }, 1000);
                    });
                }
            });
        }
    }
}