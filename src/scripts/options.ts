import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "../styles/options.scss";
import { ChannelSettingsController } from "./options/channelSettingsController";
import { GeneralSettignsController } from "./options/generalSettingsController";
import { KeywordSettingsController } from "./options/keywordSettingsController";
import { Settings } from "./options/models/settings";

class Options {
    public settings: Settings;
    public async initialize(): Promise<void> {
        this.settings = await Settings.load();
    }
}

const options = new Options();
options.initialize();
library.add(faTrashAlt, faPlus, faTimesCircle);
dom.watch();
