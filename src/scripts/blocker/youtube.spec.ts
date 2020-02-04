import { isChannel, getYouTubePage, YouTubePage } from "./youtube";

describe('test isChannel', () => {
    it.each`
        path                                    | result
        ${"/"}                                  | ${false}
        ${"/feed/trending"}                     | ${false}
        ${"/feed/subscriptions"}                | ${false}
        ${"/watch"}                             | ${false}
        ${"/user/YouTube"}                      | ${true}
        ${"/channel/UCqSB3jEAFI7jpEULtYGs7Bw"}  | ${true}
    `('should return $result when $path is checked for being a channel', ({path, result}) => {
        expect(isChannel(path)).toEqual(result);
    });
});

describe('test getYouTubePage', () => {
    it.each`
        path                                    | result
        ${""}                                   | ${YouTubePage.Frontpage}
        ${"/"}                                  | ${YouTubePage.Frontpage}
        ${"/results"}                           | ${YouTubePage.Search}
        ${"/feed/trending"}                     | ${YouTubePage.Trending}
        ${"/feed/subscriptions"}                | ${YouTubePage.Subscriptions}
        ${"/user/YouTube"}                      | ${YouTubePage.Channel}
        ${"/channel/UCqSB3jEAFI7jpEULtYGs7Bw"}  | ${YouTubePage.Channel}
        ${"/watch"}                             | ${YouTubePage.Video}
        ${"/LoremIpsum"}                        | ${YouTubePage.Undetermined}
    `('should return $result when checking the type of page of $path', ({path, result}) => {
        expect(getYouTubePage(path)).toEqual(result);
    });
});