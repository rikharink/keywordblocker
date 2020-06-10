import { BlockAction } from './blockAction';
import { ISettings } from './ISettings';
import { YouTubePage } from '../../blocker/youtube';
import { BlockItem } from './blockItem';
import { BlockDialog } from './blockDialog';
import { BlockOverlay } from './blockOverlay';
import { BlockOption } from './blockOption';

export class MockSettings implements ISettings {
    public password = '';
    public keywords: BlockItem[] = [];
    public channels: BlockItem[] = [];
    public blockDialog: BlockDialog = new BlockDialog('Blocked!', 'https://keywordblocker.nl/img/keywordblocker.png');
    public blockOverlay: BlockOverlay = new BlockOverlay('Blocked', '#CC181E', 1);
    public blockOptions: BlockOption[] = [];
    public checkDescription = true;
    public settingsVersion = 2;
    public oldSettingsBackup = '';
    public async load(): Promise<ISettings> {
        return;
    }
    public async save(): Promise<void> {
        return;
    }
    public setBlockOption(page: YouTubePage, action: BlockAction): void {
        const index = this.blockOptions.findIndex((i) => i.page === page);
        if (index === -1) {
            this.blockOptions.push(new BlockOption(page, action));
        } else {
            this.blockOptions[index].action = action;
        }
    }
    public getBlockAction(page: YouTubePage): BlockAction {
        const index = this.blockOptions.findIndex((i) => i.page === page);
        if (index !== -1) {
            return this.blockOptions[index].action;
        }
        return BlockAction.Nothing;
    }
}
