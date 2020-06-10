import { BlockDialog } from './blockDialog';
import { BlockItem } from './blockItem';
import { BlockOverlay } from './blockOverlay';
import { YouTubePage } from '../../blocker/youtube';
import { BlockOption } from './blockOption';
import { BlockAction } from './blockAction';
export interface ISettings {
    password: string;
    keywords: BlockItem[];
    channels: BlockItem[];
    blockDialog: BlockDialog;
    blockOverlay: BlockOverlay;
    blockOptions: BlockOption[];
    checkDescription: boolean;
    settingsVersion: number;
    oldSettingsBackup: string;
    load(): Promise<ISettings>;
    save(): Promise<void>;
    setBlockOption(page: YouTubePage, action: BlockAction): void;
    getBlockAction(page: YouTubePage): BlockAction;
}
