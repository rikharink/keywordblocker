import { BlockDialog } from "@options/models/blockDialog";
import { BlockItem } from "@options/models/blockItem";
export { BlockItem } from "@options/models/blockItem";
export { BlockDialog } from "@options/models/blockDialog";
import "chrome-extension-async";

export class Settings {
    public static async load(): Promise<Settings> {
        return Settings.fromLocalStorage(await chrome.storage.local.get());
    }

    public static fromImportedSettings(importedSettings: { [key: string]: any }): Settings {
        return this.fromLocalStorage(importedSettings);
    }

    private static fromLocalStorage(localStorageData: { [key: string]: any }): Settings {
        if (localStorageData.settingsVersion === 2) {
            const storedSettings = localStorageData;
            const settings = new Settings();
            settings.blockDialog = new BlockDialog(storedSettings.blockDialog.text, storedSettings.blockDialog.image);
            settings.checkDescription = storedSettings.checkDescription;
            settings.removeFromResults = storedSettings.removeFromResults;
            settings.password = storedSettings.password;
            settings.channels = storedSettings.channels
                .map((x: any) => new BlockItem(x.keyword, x.blockPartialMatch));
            settings.keywords = storedSettings.keywords
                .map((x: any) => new BlockItem(x.keyword, x.blockPartialMatch));
            return settings;
        } else if (Object.keys(localStorageData).length === 0) {
            return new Settings();
        } else {
            return this.convertOldSettings(localStorageData);
        }
    }

    private static convertOldSettings(oldSettings: { [key: string]: any }): Settings {
        const settings = new Settings();
        if (oldSettings.removeFromResults) {
            settings.removeFromResults = oldSettings.removeFromResults;
        }
        if (oldSettings.checkDescription) {
            settings.checkDescription = oldSettings.checkDescription;
        }
        if (oldSettings.password) {
            settings.password = oldSettings.password;
        }
        if (oldSettings.popOver) {
            settings.blockDialog.text = oldSettings.popOver.text;
            settings.blockDialog.image = oldSettings.popOver.image;
        }
        if (oldSettings.keywords) {
            for (const oldKeyword of oldSettings.keywords) {
                settings.keywords.push(new BlockItem(oldKeyword));
            }
        }
        if (oldSettings.wildcardKeywords) {
            for (const oldKeyword of oldSettings.wildcardKeywords) {
                settings.keywords.push(new BlockItem(oldKeyword, true));
            }
        }
        if (oldSettings.channels) {
            for (const oldChannel of oldSettings.channels) {
                settings.channels.push(new BlockItem(oldChannel));
            }
        }
        if (oldSettings.wildcardChannels) {
            for (const oldChannel of oldSettings.channels) {
                settings.channels.push(new BlockItem(oldChannel, true));
            }
        }
        return settings;
    }

    public password: string = "";
    public keywords: BlockItem[] = [];
    public channels: BlockItem[] = [];
    public blockDialog: BlockDialog = new BlockDialog("Blocked!", "https://i.imgur.com/sLmiP5n.png");
    public removeFromResults: boolean = true;
    public checkDescription: boolean = true;
    public settingsVersion: number = 2;

    private constructor() {
    }

    public async save(): Promise<void> {
        await chrome.storage.local.set(this);
    }
}
