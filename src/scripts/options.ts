import * as fontawesome from "@fortawesome/fontawesome";
import { faTimesCircle } from "@fortawesome/fontawesome-free-regular";
import { faPlus, faTrashAlt } from "@fortawesome/fontawesome-free-solid";
import "../styles/options.scss";
import { ChannelSettingsController } from "./options/channelSettingsController";
import { GeneralSettignsController } from "./options/generalSettingsController";
import { KeywordSettingsController } from "./options/keywordSettingsController";
import { Settings } from "./options/models/settings";

class Options {
    public settings: Settings;
    private generalSettingsController: GeneralSettignsController;
    private keywordSettingsController: KeywordSettingsController;
    private channelSettingsController: ChannelSettingsController;

    public async initialize(): Promise<void> {
        this.settings = await Settings.load();
        this.generalSettingsController = new GeneralSettignsController(this.settings);
        this.keywordSettingsController = new KeywordSettingsController(this.settings);
        this.channelSettingsController = new ChannelSettingsController(this.settings);
    }
}

fontawesome.library.add(faTrashAlt, faPlus, faTimesCircle);

const options = new Options();
options.initialize();
