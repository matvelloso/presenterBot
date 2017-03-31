declare namespace DirectLine {
    interface Conversation {
        conversationId: string;
        token: string;
        eTag?: string;
        streamUrl?: string;
    }
    interface Image {
        contentType: "image/png" | "image/jpg" | "image/jpeg";
        contentUrl: string;
        name?: string;
    }
    interface Button {
        type: "imBack" | "postBack" | "openUrl" | "signin";
        title: string;
        value: string;
        image?: string;
    }
    interface HeroCard {
        contentType: "application/vnd.microsoft.card.hero";
        content: {
            title?: string;
            subtitle?: string;
            text?: string;
            images?: {
                url: string;
            }[];
            buttons?: Button[];
        };
    }
    interface Thumbnail {
        contentType: "application/vnd.microsoft.card.thumbnail";
        content: {
            title?: string;
            subtitle?: string;
            text?: string;
            images?: {
                url: string;
            }[];
            buttons?: Button[];
            tap: string;
        };
    }
    interface Signin {
        contentType: "application/vnd.microsoft.card.signin";
        content: {
            text?: string;
            buttons?: Button[];
        };
    }
    interface ReceiptItem {
        title?: string;
        subtitle?: string;
        text?: string;
        image?: {
            url: string;
        };
        price?: string;
        quantity?: string;
        tap?: string;
    }
    interface Receipt {
        contentType: "application/vnd.microsoft.card.receipt";
        content: {
            title?: string;
            facts?: {
                key: string;
                value: string;
            }[];
            items?: ReceiptItem[];
            tap?: string;
            tax?: string;
            VAT?: string;
            total?: string;
            buttons?: Button[];
        };
    }
    type Attachment = Image | HeroCard | Thumbnail | Signin | Receipt;
    interface Message {
        type: "message";
        id?: string;
        conversation?: {
            id: string;
        };
        timestamp?: string;
        from?: {
            id: string;
        };
        text?: string;
        local?: string;
        textFormat?: "plain" | "markdown" | "xml";
        channelData?: any;
        attachmentLayout?: "list" | "carousel";
        attachments?: Attachment[];
        eTag?: string;
        channelId?: string;
        entities?: any[];
    }
    interface Typing {
        type: "typing";
    }
    type Activity = Message | Typing;
    interface DLAttachment {
        url: string;
        contentType: string;
    }
    interface DLMessage {
        id?: string;
        conversationId?: string;
        created?: string;
        from?: string;
        text?: string;
        channelData?: any;
        images?: string[];
        attachments?: DLAttachment[];
        eTag?: string;
    }
    interface DLMessageGroup {
        messages: DLMessage[];
        watermark?: string;
        eTag?: string;
    }
    class Client {
        private status;
        private currentConversation;
        private appSecret;
        private currentWatermark;
        private messagesReceivedCallback;
        private timer;
        constructor(messagesReceivedCallback: (messages: DLMessageGroup, done: () => void) => void);
        getStatus(): string;
        getCurrentConversatoin(): Conversation;
        private createRequestObject(actionType, urlToCall, accept, authorization);
        makeHttpRequest(xhr: XMLHttpRequest, content: string, resultCallback: (resultText: string, resultError: string) => void): void;
        startConversation(appSecret: string, resultCallback: (conversation: Conversation, resultError: string) => void): void;
        private QueryMessages();
        postMessage(text: string, userId: string): void;
        private getActivities(resultCallback);
    }
}
