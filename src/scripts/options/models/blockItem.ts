export class BlockItem {
    public keyword: string;
    public blockPartialMatch: boolean;

    constructor(keyword: string, blockPartialMatch: boolean = false) {
        this.keyword = keyword;
        this.blockPartialMatch = blockPartialMatch;
    }

    public getElement(): HTMLElement {
        const row = document.createElement("tr");
        row.classList.add("keyword-row");
        const channel = document.createElement("td");
        channel.innerText = this.keyword;
        const wildcard = document.createElement("td");
        wildcard.classList.add("center-cell-content");
        const wildcardInput = document.createElement("input");
        wildcardInput.type = "checkbox";
        wildcardInput.classList.add("block-partial");
        if (this.blockPartialMatch) {
            wildcardInput.checked = true;
        }
        wildcard.appendChild(wildcardInput);
        const remove = document.createElement("td");
        remove.classList.add("center-cell-content");
        const removeButton = document.createElement("button");
        removeButton.classList.add("button");
        const icon = document.createElement("i");
        icon.classList.add("fas", "fa-trash-alt");
        removeButton.appendChild(icon);
        remove.appendChild(removeButton);
        row.appendChild(channel);
        row.appendChild(wildcard);
        row.appendChild(remove);
        return row;
    }
}
