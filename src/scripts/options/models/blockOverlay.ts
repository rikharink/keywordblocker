export class BlockOverlay {
    public text: string;
    public color: string;

    constructor(text: string, color: string) {
        this.text = text;
        this.color = color;
    }

    public getElement(): HTMLElement {
        const blockOverlayContainer = document.createElement("div");
        blockOverlayContainer.classList.add("block-overlay");
        blockOverlayContainer.style.setProperty("background", this.color);
        const text = document.createElement("p");
        text.innerText = this.text;
        blockOverlayContainer.appendChild(text);
        return blockOverlayContainer;
    }
}
