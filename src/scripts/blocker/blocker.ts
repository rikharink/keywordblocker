import { getYouTubePage, isChannel, YouTubePage } from "@blocker/youtube";
import { BlockAction, BlockItem, Settings } from "@options/models/settings";
import { fromEvent, interval, merge } from "rxjs";
import { filter, pluck } from "rxjs/operators";
export class Blocker {
    public readonly videoNodeNames = [
        "YTD-GRID-VIDEO-RENDERER",
        "YTD-VIDEO-RENDERER",
        "YTD-COMPACT-VIDEO-RENDERER",
        "YTD-PLAYLIST-RENDERER",
        "YTD-MOVIE-RENDERER",
        "YTD-CHANNEL-RENDERER",
    ];
    private settings: Settings;
    private partialMatchKeywords: string[];
    private wholeMatchKeywords: string[];
    private partialMatchChannels: string[];
    private wholeMatchChannels: string[];
    private partialMatchKeywordsRegExp: RegExp;
    private wholeMatchKeywordsRegExp: RegExp;
    private partialMatchChannelsRegExp: RegExp;
    private wholeMatchChannelsRegExp: RegExp;
    private clickedChannel: string;

    public async init(): Promise<void> {
        await this.loadSettings();
        this.watchRightClick();
        this.watchRequestListeners();
    }

    public async loadSettings(): Promise<void> {
        this.settings = await Settings.load();
        this.wholeMatchKeywords = this.settings.keywords
            .filter((keyword) => !keyword.blockPartialMatch)
            .map((x) => x.keyword);
        this.partialMatchKeywords = this.settings.keywords
            .filter((keyword) => keyword.blockPartialMatch)
            .map((x) => x.keyword);
        this.wholeMatchChannels = this.settings.channels
            .filter((channel) => !channel.blockPartialMatch)
            .map((x) => x.keyword);
        this.partialMatchChannels = this.settings.channels
            .filter((channel) => channel.blockPartialMatch)
            .map((x) => x.keyword);

        const begin = "(?:-|\\s|\\W|^)";
        const end = "(?:-|\\s|\\W|$)";
        this.wholeMatchKeywordsRegExp = new RegExp(`${begin}(?:${this.wholeMatchKeywords.join("|")})${end}`, "i");

        const partialKeywordRegExp = this.partialMatchKeywords.map((x) => "(.)*" + x + "(.)*").join("|");
        this.partialMatchKeywordsRegExp = new RegExp(`(?:${partialKeywordRegExp})`, "i");

        this.wholeMatchChannelsRegExp = new RegExp(`^(?:${this.wholeMatchChannels.join("|")})$`, "i");

        const partialChannelRegExp = this.partialMatchChannels.map((x) => "(.)*" + x + "(.)*").join("|");
        this.partialMatchChannelsRegExp = new RegExp(`(?:${partialChannelRegExp})`, "i");
    }

    public checkForBlockedVideos(): void {
        const title = document.querySelector("h1.title");
        const description = document.getElementById("description");
        const page = getYouTubePage();
        const action = this.settings.getBlockAction(page);
        if (page === YouTubePage.Video) {
            if (action === BlockAction.Block) {
                if (title && this.isKeywordBlocked(title.textContent)) {
                    this.hideVideo();
                    this.showPopup();
                }
                if (this.settings.checkDescription && description && this.isKeywordBlocked(description.textContent)) {
                    this.hideVideo();
                    this.showPopup();
                }
            } else if (action === BlockAction.Redirect) {
                this.hideVideo();
                window.location.assign("https://www.youtube.com");
            }
        }

        const videos = this.getVideos();
        videos.filter((video) => {
            const videoTitle = video.querySelector("#video-title");
            const channelTitle = video.querySelector<HTMLSpanElement>("#channel-title span");
            const channel = video.querySelector("#metadata a");
            let blocked = false;

            if (this.settings.channels.length > 0 && (channel || channelTitle)) {
                if (channelTitle) {
                    blocked = blocked || this.isChannelBlocked(channelTitle.textContent);
                }
                if (channel) {
                    blocked = blocked || this.isChannelBlocked(channel.textContent);
                }
            }
            if (this.settings.keywords.length > 0 && videoTitle) {
                blocked = blocked || this.isKeywordBlocked(videoTitle.getAttribute("title"));
            }
            return blocked;
        }).map((x) => this.remove(x));
    }

    public remove(node: HTMLElement): void {
        const action = this.settings.getBlockAction(getYouTubePage());
        if (action === BlockAction.Block) {
            node.style.pointerEvents = "none";
            node.style.userSelect = "none";
            node.style.position = "relative";
            if (!node.querySelector(".block-overlay")) {
                node.appendChild(this.settings.blockOverlay.getElement());
            }
        } else if (action === BlockAction.Remove) {
            node.remove();
        }
    }

    public showPopup(): void {
        document.body.innerHTML = "";
        document.body.appendChild(this.settings.blockDialog.getElement());
        const containerEle = document.querySelector(".block-dialog-container");
        const closeEle = document.querySelector(".close");
        const container = fromEvent(containerEle, "click");
        const close = fromEvent(closeEle, "click");
        merge(container, close).subscribe(() => window.location.assign("https://www.youtube.com"));
    }

    public hideVideo(): void {
        const subscription = interval(100)
            .subscribe(() => {
                const video = document.querySelector("video");
                const app = document.querySelector("ytd-app");
                if (video && app) {
                    video.pause();
                    app.remove();
                    subscription.unsubscribe();
                }
            });
    }

    public isChannelBlocked(channel: string): boolean {
        if (this.partialMatchChannels.length > 0) {
            if (channel.search(this.partialMatchChannelsRegExp) !== -1) {
                return true;
            }
        }
        if (this.wholeMatchChannels.length > 0) {
            return channel.search(this.wholeMatchChannelsRegExp) !== -1;
        }
    }

    public isKeywordBlocked(toCheck: string): boolean {
        if (this.partialMatchKeywords.length > 0) {
            if (toCheck.search(this.partialMatchKeywordsRegExp) !== -1) {
                return true;
            }
        }
        if (this.wholeMatchKeywords.length > 0) {
            return toCheck.search(this.wholeMatchKeywordsRegExp) !== -1;
        }
    }

    public getVideos(): HTMLElement[] {
        const videos: Element[] = [];
        for (const tag of this.videoNodeNames) {
            videos.push(...document.getElementsByTagName(tag));
        }
        return videos.map((x) => x as HTMLElement);
    }

    public watchRightClick(): void {
        fromEvent(document, "mousedown")
            .pipe(
                filter((event: MouseEvent) => event.button === 2),
                pluck("target"),
                filter<HTMLElement>((t) => t instanceof HTMLElement
                    && t.closest("ytd-grid-video-renderer") !== null),
            )
            .subscribe((t) => {
                const videoGridRenderer = t.closest("ytd-grid-video-renderer");
                if (!videoGridRenderer) {
                    return;
                }
                const channelLink = videoGridRenderer.querySelector<HTMLAnchorElement>("#byline > a");
                if (!channelLink || !isChannel(channelLink.pathname)) {
                    return;
                }
                this.clickedChannel = channelLink.textContent;
            });
    }

    public watchRequestListeners(): void {
        chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
            await sendResponse(true);
            if (request === "blockChannel") {
                await this.addChannel(this.clickedChannel, false);
                await this.loadSettings();
                this.checkForBlockedVideos();
            } else if (request === "checkForBlocks") {
                await this.loadSettings();
                this.checkForBlockedVideos();
            }
        });
    }

    public async addChannel(channel: string, blockPartial: boolean): Promise<void> {
        const channelArray = this.settings.channels.map((x: BlockItem) => x.keyword);
        if (channelArray && channelArray.indexOf(channel) === -1) {
            this.settings.channels.push(new BlockItem(channel, blockPartial));
            await this.settings.save();
        }
    }
}
