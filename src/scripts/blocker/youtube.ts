export enum YouTubePage {
    Frontpage = 0,
    Search = 1,
    Trending = 2,
    Subscriptions = 3,
    Channel = 4,
    Video = 5,
    Undetermined = 999,
}

export function isChannel(location: string): boolean {
    const path = location.split('/').filter(x => x !== '');
    if (path.length < 2) {
        return false;
    }
    return path[0] === 'user' || path[0] === 'c' || path[0] === 'channel';
}

export function getYouTubePage(): YouTubePage {
    const path = window.location.pathname;
    if (path === '' || path === '/') {
        return YouTubePage.Frontpage;
    } else if (path === '/feed/trending') {
        return YouTubePage.Trending;
    } else if (path === '/feed/subscriptions') {
        return YouTubePage.Subscriptions;
    } else if (path === '/results') {
        return YouTubePage.Search;
    } else if (path === '/watch') {
        return YouTubePage.Video;
    } else if (isChannel(window.location.pathname)) {
        return YouTubePage.Channel;
    } else {
        return YouTubePage.Undetermined;
    }
}
