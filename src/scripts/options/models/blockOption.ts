import { YouTubePage } from "@blocker/youtube";
import { BlockAction } from "@options/models/settings";

export class BlockOption {
    public page: YouTubePage;
    public action: BlockAction;

    public constructor(page: YouTubePage, action: BlockAction) {
        this.page = page;
        this.action = action;
    }
}
