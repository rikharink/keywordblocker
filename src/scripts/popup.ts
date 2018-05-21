import "@styles/popup";
import "chrome-extension-async";
import { fromEvent } from "rxjs";

fromEvent(document.getElementById("open-options"), "click")
    .subscribe(async () => await chrome.tabs.create({url: "/options.html"}));
