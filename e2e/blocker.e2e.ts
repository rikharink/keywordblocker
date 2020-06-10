import { videoNodeNames } from '../src/scripts/blocker/videoNodeNames';

describe('Can I find the video information', () => {
    beforeAll(async () => {
        await page.goto('https://www.youtube.com/results?search_query=vampier');
    });

    it('should find video elements', async () => {
        const result = await page.evaluate((nodenames: string[]) => {
            function getVideoNodes() {
                const videos: Element[] = [];
                for (const tag of nodenames) {
                    videos.push(...document.getElementsByTagName(tag));
                }
                return videos.map((x) => x as HTMLElement);
            }
            return getVideoNodes().length;
        }, videoNodeNames);
        expect(result).toBeGreaterThan(0);
    });
});
