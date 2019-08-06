import { Container } from "inversify";
import "reflect-metadata";
import { Blocker } from "./blocker/blocker";
import { ChannelSettingsController } from "./options/channelSettingsController";
import { GeneralSettingsController } from "./options/generalSettingsController";
import { KeywordSettingsController } from "./options/keywordSettingsController";
import { Settings, SettingsProvider } from "./options/models/settings";

const container = new Container();
container.bind<Settings>(Settings)
    .toSelf().inSingletonScope();
container.bind<SettingsProvider>("SettingsProvider")
    .toProvider<Settings>((context) => context.container.get<Settings>(Settings).load);
container.bind<Blocker>(Blocker).toSelf();
container.bind<GeneralSettingsController>(GeneralSettingsController).toSelf();
container.bind<KeywordSettingsController>(KeywordSettingsController).toSelf();
container.bind<ChannelSettingsController>(ChannelSettingsController).toSelf();
export default container;
