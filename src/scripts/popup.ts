import "chrome-extension-async";
import { fromEvent } from "rxjs";
import "../styles/popup.scss";

fromEvent(document.getElementById("open-options"), "click")
    .subscribe(async () => await chrome.tabs.create({ url: "/options.html" }));
