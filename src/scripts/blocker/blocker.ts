import { fromEvent, interval, merge } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { BlockItem } from '../options/models/blockItem';
import { BlockAction } from '../options/models/blockAction';
import { ISettings } from '../options/models/ISettings';
import { getYouTubePage, isChannel, YouTubePage } from './youtube';
import { videoNodeNames } from './videoNodeNames';

export class Blocker {
    private settings: ISettings;
    private partialMatchKeywords: string[];
    private wholeMatchKeywords: string[];
    private partialMatchChannels: string[];
    private wholeMatchChannels: string[];
    private partialMatchKeywordsRegExp: RegExp;
    private wholeMatchKeywordsRegExp: RegExp;
    private partialMatchChannelsRegExp: RegExp;
    private wholeMatchChannelsRegExp: RegExp;
    private clickedChannel: string;

    constructor(settings: ISettings) {
        this.settings = settings;
    }

    public async init(): Promise<void> {
        await this.loadSettings();
        this.watchRightClick();
        this.watchRequestListeners();
    }

    public async loadSettings(): Promise<void> {
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

        const begin = '(?:-|\\s|\\W|^)';
        const end = '(?:-|\\s|\\W|$)';
        this.wholeMatchKeywordsRegExp = new RegExp(`${begin}(?:${this.wholeMatchKeywords.join('|')})${end}`, 'i');

        const partialKeywordRegExp = this.partialMatchKeywords.map((x) => '(.)*' + x + '(.)*').join('|');
        this.partialMatchKeywordsRegExp = new RegExp(`(?:${partialKeywordRegExp})`, 'i');

        this.wholeMatchChannelsRegExp = new RegExp(`^(?:${this.wholeMatchChannels.join('|')})$`, 'i');

        const partialChannelRegExp = this.partialMatchChannels.map((x) => '(.)*' + x + '(.)*').join('|');
        this.partialMatchChannelsRegExp = new RegExp(`(?:${partialChannelRegExp})`, 'i');
    }

    public checkForBlockedVideos(): void {
        const title = document.querySelector('h1.title');
        const description = document.getElementById('description');
        const page = getYouTubePage(window.location.pathname);
        const action = this.settings.getBlockAction(page);
        if (page === YouTubePage.Video) {
            const titleBlocked = title && this.isKeywordBlocked(title.textContent.trim());
            const descriptionBlocked =
                description && this.settings.checkDescription && this.isKeywordBlocked(description.textContent.trim());
            const videoBlocked = titleBlocked || descriptionBlocked;
            if (videoBlocked) {
                if (action !== BlockAction.Nothing) {
                    this.hideVideo();
                }
                if (action === BlockAction.Block) {
                    this.showPopup();
                } else if (action === BlockAction.Redirect) {
                    window.location.assign('https://www.youtube.com');
                }
            }
        }

        const videos = this.getVideos();
        videos
            .filter((video) => {
                const videoTitle = video.querySelector<HTMLElement>('#video-title');
                const channelTitle = video.querySelector<HTMLSpanElement>('#channel-title span');
                const channel = video.querySelector('#metadata a');
                const owner = video.querySelector<HTMLAnchorElement>('#owner-name a');
                const byline = video.querySelector('#byline');

                console.log(videoTitle, channelTitle, channel, owner, byline);
                let blocked = false;

                if (this.settings.channels.length > 0 && (channel || channelTitle || owner || byline)) {
                    if (channelTitle) {
                        blocked = blocked || this.isChannelBlocked(channelTitle.textContent.trim());
                    }
                    if (channel) {
                        blocked = blocked || this.isChannelBlocked(channel.textContent.trim());
                    }
                    if (owner) {
                        blocked = blocked || this.isChannelBlocked(owner.textContent.trim());
                    }
                    if (byline) {
                        blocked = blocked || this.isChannelBlocked(byline.textContent.trim());
                    }
                }
                if (this.settings.keywords.length > 0 && videoTitle) {
                    blocked = blocked || this.isKeywordBlocked(videoTitle.innerText);
                }
                return blocked;
            })
            .map((x) => this.remove(x));
    }

    public remove(node: HTMLElement): void {
        const action = this.settings.getBlockAction(getYouTubePage(window.location.pathname));
        if (action === BlockAction.Block) {
            node.style.pointerEvents = 'none';
            node.style.userSelect = 'none';
            node.style.position = 'relative';
            if (!node.querySelector('.block-overlay')) {
                node.appendChild(this.settings.blockOverlay.getElement());
            }
        } else if (action === BlockAction.Remove) {
            node.remove();
        }
    }

    public showPopup(): void {
        document.body.innerHTML = '';
        document.body.appendChild(this.settings.blockDialog.getElement());
        const containerEle = document.querySelector('.block-dialog-container');
        const closeEle = document.querySelector('.close');
        const container = fromEvent(containerEle, 'click');
        const close = fromEvent(closeEle, 'click');
        merge(container, close).subscribe(() => window.location.assign('https://www.youtube.com'));
    }

    public hideVideo(): void {
        const subscription = interval(100).subscribe(() => {
            const video = document.querySelector('video');
            const app = document.querySelector('ytd-app');
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
            return toCheck.search(this.partialMatchKeywordsRegExp) !== -1;
        }
        if (this.wholeMatchKeywords.length > 0) {
            return toCheck.search(this.wholeMatchKeywordsRegExp) !== -1;
        }
    }

    public getVideos(): HTMLElement[] {
        const videos: Element[] = [];
        for (const tag of videoNodeNames) {
            videos.push(...document.getElementsByTagName(tag));
        }
        return videos.map((x) => x as HTMLElement);
    }

    public watchRightClick(): void {
        fromEvent(document, 'mousedown')
            .pipe(
                filter((event: MouseEvent) => event.button === 2),
                pluck('target'),
                filter<HTMLElement>(
                    (t) =>
                        t instanceof HTMLElement &&
                        (t.closest('ytd-grid-video-renderer') !== null ||
                            t.closest('ytd-compact-video-renderer') != null),
                ),
            )
            .subscribe((t) => {
                const videoGridRenderer = t.closest('ytd-grid-video-renderer');
                const compactVideoRenderer = t.closest('ytd-compact-video-renderer');

                if (!(videoGridRenderer || compactVideoRenderer)) {
                    return;
                }
                if (videoGridRenderer) {
                    const channel = videoGridRenderer.querySelector<HTMLAnchorElement>('#byline > a');
                    if (channel && isChannel(channel.pathname)) {
                        this.clickedChannel = channel.textContent.trim();
                    }
                } else if (compactVideoRenderer) {
                    const channel = compactVideoRenderer.querySelector<HTMLAnchorElement>('#byline');
                    this.clickedChannel = channel.textContent.trim();
                }
            });
    }

    public watchRequestListeners(): void {
        chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
            await sendResponse(true);
            if (request === 'blockChannel') {
                if (this.clickedChannel) {
                    await this.addChannel(this.clickedChannel, false);
                    await this.loadSettings();
                    this.checkForBlockedVideos();
                }
            } else if (request === 'checkForBlocks') {
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
