import "chrome-extension-async";
import { fromEvent } from "rxjs";
import "../styles/popup.scss";

let observable = fromEvent(document.getElementById("open-options"), "click");
observable.subscribe({
    next: () => chrome.tabs.create({ url: "/options.html" }),
});
