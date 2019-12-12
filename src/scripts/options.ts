import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/options.scss';
import { ChannelSettingsController } from './options/channelSettingsController';
import { GeneralSettingsController } from './options/generalSettingsController';
import { KeywordSettingsController } from './options/keywordSettingsController';
import { Settings } from './options/models/settings';

export class Options {
    private generalSettingsController: GeneralSettingsController;
    private keywordSettingsController: KeywordSettingsController;
    private channelSettingsController: ChannelSettingsController;

    constructor(
        generalSettingsController: GeneralSettingsController,
        keywordSettingsController: KeywordSettingsController,
        channelSettingsController: ChannelSettingsController,
    ) {
        this.generalSettingsController = generalSettingsController;
        this.keywordSettingsController = keywordSettingsController;
        this.channelSettingsController = channelSettingsController;
    }

    public async initialize(): Promise<void> {
        await this.generalSettingsController.initialize();
        await this.keywordSettingsController.initialize();
        await this.channelSettingsController.initialize();
    }
}

library.add(faTrashAlt, faPlus, faTimesCircle);
dom.watch();
new Settings().load().then(settings => {
    new Options(
        new GeneralSettingsController(settings),
        new KeywordSettingsController(settings),
        new ChannelSettingsController(settings),
    ).initialize();
});
