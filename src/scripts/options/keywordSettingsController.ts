import { BlockItemSettingsController } from "./blockItemSettingsController";
import { BlockItem, Settings, SettingsProvider } from "./models/settings";
import { inject, injectable } from "inversify";

@injectable()
export class KeywordSettingsController extends BlockItemSettingsController {
    private settings: Settings;
    private settingsProvider: SettingsProvider;

    constructor(@inject("SettingsProvider") settingsProvider: SettingsProvider) {
        super();
        this.settingsProvider = settingsProvider;
    }

    public async initialize(): Promise<void> {
        this.settings = await this.settingsProvider();
        this.displayKeywords();
    }

    private displayKeywords(): void {
        this.displayBlockItems(this.settings.keywords, document.getElementById("keywords"), "keyword-input", "Keyword");
        this.watchKeywords();
    }

    private watchKeywords(): void {
        this.watchAddKeyword();
        this.watchRemoveKeyword();
        this.watchBlockPartialKeyword();
    }

    private watchAddKeyword(): void {
        const addKeyword = async () => {
            const input = document.querySelector("#keyword-input .keyword") as HTMLInputElement;
            const blockPartial = document.querySelector("#keyword-input .block-partial") as HTMLInputElement;
            const keyword = input.value;
            const keywordArray = this.settings.keywords.map((x) => x.keyword);
            if (keyword.length > 0 && keywordArray.indexOf(keyword) === -1) {
                this.settings.keywords.push(new BlockItem(keyword, blockPartial.checked));
                await this.settings.save();
                this.displayKeywords();
            }
        };

        const button: HTMLElement = document.querySelector("#keyword-input .button");
        const row: HTMLElement = document.querySelector("#keyword-input");
        this.watchAddBlockItem(row, button, addKeyword);
    }

    private watchRemoveKeyword(): void {
        const removeButtons = document.querySelectorAll("#keywords .keyword-row .button");
        const removeKeyword = async (index: number) => {
            this.settings.keywords.splice(index, 1);
            await this.settings.save();
            this.displayKeywords();
        };
        this.watchRemoveBlockItem(removeButtons, removeKeyword);
    }

    private watchBlockPartialKeyword(): void {
        const blockPartialCheckboxes = document.querySelectorAll("#keywords .keyword-row .block-partial");
        const toggleBlockPartial = async (checkbox: HTMLInputElement) => {
            const status = checkbox.checked;
            const index = parseInt((checkbox.closest(".keyword-row") as HTMLElement).dataset.index, 10);
            this.settings.keywords[index].blockPartialMatch = status;
            await this.settings.save();
            this.displayKeywords();
        };
        this.watchBlockPartialBlockItem(blockPartialCheckboxes, toggleBlockPartial);
    }

}
