import { BlockItem, Settings } from "@options/models/settings";
import { fromEvent, Observable} from "rxjs";
import { filter, map, pluck } from "rxjs/operators";

export abstract class BlockItemSettingsController {
    protected settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }

    protected displayBlockItems(items: BlockItem[], element: HTMLElement, inputRowId: string, placeholder: string) {
        element.innerHTML = "";
        let i = 0;
        for (const item of items) {
            const el = item.getElement();
            el.dataset.index = i.toString();
            element.appendChild(el);
            i++;
        }
        element.appendChild(this.getInputRow(inputRowId, placeholder));
    }

    protected watchAddBlockItem(row: HTMLElement, button: HTMLElement, action: () => Promise<void>): void {
        fromEvent(button, "click")
            .subscribe(() => action());
        fromEvent(row, "keyup")
            .pipe(filter((ev: KeyboardEvent) => ev.key === "Enter"))
            .subscribe(() => action());
    }

    protected watchRemoveBlockItem(buttons: NodeListOf<Element>, action: (index: number) => Promise<void>): void {
        for (const button of buttons) {
            fromEvent(button, "click").pipe(
                pluck("target"),
                map((el: HTMLElement) => el.closest(".keyword-row")),
                pluck("dataset"),
                pluck("index"))
                .subscribe(async (index: number) => {
                    await action(index);
                });
        }
    }

    protected watchBlockPartialBlockItem(checkboxes: NodeListOf<Element>,
                                         action: (checkbox: HTMLInputElement) => Promise<void>): void {
        for (const checkbox of checkboxes) {
            fromEvent(checkbox, "click")
                .pipe(pluck("target"))
                .subscribe(async (blockPartial: HTMLInputElement) => {
                    await action(blockPartial);
                });
        }
    }

    private getInputRow(id: string, placeholder: string): HTMLElement {
        const inputRow = document.createElement("tr");
        inputRow.id = id;
        const keywordInputCell = document.createElement("td");
        const keywordInput = document.createElement("input");
        keywordInput.type = "text";
        keywordInput.classList.add("keyword");
        keywordInput.placeholder = placeholder;
        keywordInput.autofocus = true;
        keywordInputCell.appendChild(keywordInput);
        const blockPartialCell = document.createElement("td");
        blockPartialCell.classList.add("center-cell-content");
        const blockPartial = document.createElement("input");
        blockPartial.type = "checkbox";
        blockPartial.classList.add("block-partial");
        blockPartialCell.appendChild(blockPartial);
        const addButtonCell = document.createElement("td");
        addButtonCell.classList.add("center-cell-content");
        const addButton = document.createElement("button");
        addButton.classList.add("button");
        const addButtonIcon = document.createElement("i");
        addButtonIcon.classList.add("fas", "fa-plus");
        addButton.appendChild(addButtonIcon);
        addButtonCell.appendChild(addButton);
        inputRow.appendChild(keywordInputCell);
        inputRow.appendChild(blockPartialCell);
        inputRow.appendChild(addButtonCell);
        return inputRow;
    }
}
