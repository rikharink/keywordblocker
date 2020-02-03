import 'chrome-extension-async';
import { BlockItem, Settings } from './options/models/settings';

export class Background {
    private settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }

    public async initialize(): Promise<void> {
        this.setupContextMenus();
    }

    public async setupContextMenus(): Promise<void> {
        const patterns = ['*://www.youtube.com/*'];

        await chrome.contextMenus.create({
            contexts: ['selection'],
            documentUrlPatterns: patterns,
            onclick: async (info, tab) => {
                if (info.selectionText) {
                    this.addKeyword(info.selectionText, false);
                    await chrome.tabs.sendMessage(tab.id, 'checkForBlocks');
                }
            },
            title: 'Add selection as blocked keyword',
        });

        await chrome.contextMenus.create({
            contexts: ['selection'],
            documentUrlPatterns: patterns,
            onclick: async (info, tab) => {
                if (info.selectionText) {
                    this.addKeyword(info.selectionText, true);
                    await chrome.tabs.sendMessage(tab.id, 'checkForBlocks');
                }
            },
            title: 'Add selection as blocked wildcard keyword',
        });

        chrome.contextMenus.create({
            contexts: ['selection'],
            documentUrlPatterns: patterns,
            onclick: async (info, tab) => {
                if (info.selectionText) {
                    this.addChannel(info.selectionText, false);
                    await chrome.tabs.sendMessage(tab.id, 'checkForBlocks');
                }
            },
            title: 'Add selection as blocked channel',
        });

        chrome.contextMenus.create({
            contexts: ['selection'],
            documentUrlPatterns: patterns,
            onclick: async (info, tab) => {
                if (info.selectionText) {
                    this.addChannel(info.selectionText, true);
                    await chrome.tabs.sendMessage(tab.id, 'checkForBlocks');
                }
            },
            title: 'Add selection as blocked channel keyword',
        });

        chrome.contextMenus.create({
            contexts: ['link'],
            documentUrlPatterns: patterns,
            onclick: async (_, tab) => {
                await chrome.tabs.sendMessage(tab.id, 'blockChannel');
            },
            targetUrlPatterns: [
                '*://www.youtube.com/user/*',
                '*://www.youtube.com/channel/*',
                '*://www.youtube.com/c/*',
                '*://www.youtube.com/watch?v=*',
            ],
            title: 'Block channel',
        });
    }

    private async addKeyword(keyword: string, blockPartial: boolean): Promise<void> {
        const keywordArray = this.settings.keywords.map((x: BlockItem) => x.keyword);
        if (keyword.length > 0 && keywordArray.indexOf(keyword) === -1) {
            this.settings.keywords.push(new BlockItem(keyword, blockPartial));
            await this.settings.save();
        }
    }

    private async addChannel(channel: string, blockPartial: boolean): Promise<void> {
        const channelArray = this.settings.channels.map((x: BlockItem) => x.keyword);
        if (channelArray.length > 0 && channelArray.indexOf(channel) === -1) {
            this.settings.channels.push(new BlockItem(channel, blockPartial));
            await this.settings.save();
        }
    }
}

new Settings().load().then(settings => {
    new Background(settings).initialize();
});
