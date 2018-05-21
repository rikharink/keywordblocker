export class BlockOverlay {
    public text: string;
    public color: string;

    constructor(text: string, color: string) {
        this.text = text;
        this.color = color;
    }

    public getElement(): HTMLElement {
        const blockOverlayContainer = document.createElement("div");
        return blockOverlayContainer;
    }
}
