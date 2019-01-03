export class BlockDialog {
    public text: string;
    public image: string;

    constructor(text: string, image: string) {
        this.text = text;
        this.image = image;
    }

    public getElement(): HTMLElement {
        const blockDialogContainer = document.createElement("div");
        blockDialogContainer.id = "block-modal";
        blockDialogContainer.classList.add("block-dialog-container");
        const blockDialog = document.createElement("div");
        blockDialog.classList.add("block-dialog");
        const img = document.createElement("img");
        const text = document.createElement("p");
        const close = document.createElement("i");
        close.classList.add("far", "fa-times-circle", "close");
        img.src = this.image;
        text.innerText = this.text;
        blockDialog.appendChild(img);
        blockDialog.appendChild(text);
        blockDialog.appendChild(close);
        blockDialogContainer.appendChild(blockDialog);
        return blockDialogContainer;
    }
}
