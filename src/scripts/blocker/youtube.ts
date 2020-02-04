export enum YouTubePage {
    Frontpage = 0,
    Search = 1,
    Trending = 2,
    Subscriptions = 3,
    Channel = 4,
    Video = 5,
    Undetermined = 999,
}

export function isChannel(pathname: string): boolean {
    const path = pathname.split('/').filter(x => x !== '');
    if (path.length < 2) {
        return false;
    }
    return path[0] === 'user' || path[0] === 'c' || path[0] === 'channel';
}

export function getYouTubePage(pathname: string): YouTubePage {
    if (pathname === '' || pathname === '/') {
        return YouTubePage.Frontpage;
    } else if (pathname === '/feed/trending') {
        return YouTubePage.Trending;
    } else if (pathname === '/feed/subscriptions') {
        return YouTubePage.Subscriptions;
    } else if (pathname === '/results') {
        return YouTubePage.Search;
    } else if (pathname === '/watch') {
        return YouTubePage.Video;
    } else if (isChannel(pathname)) {
        return YouTubePage.Channel;
    } else {
        return YouTubePage.Undetermined;
    }
}
