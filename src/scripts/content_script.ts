import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { interval } from 'rxjs';
import { debounce } from 'ts-debounce';
import '../styles/content_script.scss';
import { Blocker } from './blocker/blocker';
import { Settings } from './options/models/settings';

const ignoredChanges: string[] = ['YTD-MOVING-THUMBNAIL-RENDERER', 'svg', 'PAPER-TOOLTIP', '#text'];
let blocker: Blocker;
function handleUpdate(records: MutationRecord[]): void {
    const added = records
        .map(record => [...record.addedNodes])
        .reduce((x, y) => x.concat(y))
        .filter((x: HTMLElement) => {
            return (
                ignoredChanges.indexOf(x.nodeName) === -1 && (!x.classList || !x.classList.contains('result-blocker'))
            );
        });
    if (added.length > 0) {
        blocker.checkForBlockedVideos();
    }
}

const debounceTime = 250;
const mutationObserver = new MutationObserver(debounce(handleUpdate, debounceTime));

library.add(faTimesCircle);
dom.watch();
new Settings().load().then(settings => {
    blocker = new Blocker(settings);
    blocker.init().then(() => {
        const subscription = interval(100).subscribe(() => {
            if (document.getElementById('content')) {
                const youtubeApp = document.getElementById('content');
                const options: MutationObserverInit = {
                    attributes: false,
                    childList: true,
                    subtree: true,
                };
                mutationObserver.observe(youtubeApp, options);
                blocker.checkForBlockedVideos();
                subscription.unsubscribe();
            }
        });
    });
});
