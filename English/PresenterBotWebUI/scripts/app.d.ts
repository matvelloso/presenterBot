declare var _murphy: any;
declare class App {
    private appSecret;
    private client;
    private txtInput;
    private chatWindow;
    private userid;
    private bingTTSClient;
    private renderingXMLCard;
    run(): void;
    inputKeyDown(evt: KeyboardEvent): boolean;
    renderXMLCard(card: Document, count?: number): void;
    private scrollToBottom();
    animateBot(animation: string, callback: () => void): void;
    showBotImage(url: string, callback: () => void): void;
    showBotIframe(url: string, callback: () => void): void;
    showBotLink(link: string, callback: () => void): void;
    showBotText(text: string, callback: () => void): void;
    playMusic(url: string, callback: () => void): void;
    openBulletList(): void;
    closeBulletList(): void;
    showBullet(text: string, callback: () => void): void;
    showBotList(list: Node, callback: () => void): void;
    messagesReceivedCallback(messages: DirectLine.DLMessageGroup, done: () => void, count?: number): void;
}
declare var app: App;
