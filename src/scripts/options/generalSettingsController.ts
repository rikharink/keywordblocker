import { Settings, BlockAction } from "@options/models/settings";
import { from, fromEvent, Observable } from "rxjs";
import { debounceTime, filter, mergeMap, pluck } from "rxjs/operators";
import { YouTubePage } from "@blocker/youtube";

export class GeneralSettignsController {
    private settings: Settings;
    private providedPassword: string;

    private passwordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    private checkDescription: HTMLInputElement = document.getElementById("check-description") as HTMLInputElement;
    private blockDialogText: HTMLInputElement = document.getElementById("block-dialog-text") as HTMLInputElement;
    private blockDialogImage: HTMLInputElement = document.getElementById("block-dialog-image") as HTMLInputElement;
    private blockDialogPreview: Element = document.getElementById("block-dialog-preview");
    private importSettings: Element = document.getElementById("import-settings");
    private exportSettings: Element = document.getElementById("export-settings");
    private importFileInput: HTMLInputElement = document.getElementById("import") as HTMLInputElement;

    constructor(settings: Settings) {
        this.settings = settings;
        if (this.checkPassword()) {
            this.showSettigns();
        } else {
            this.askForPassword();
        }
    }

    private checkPassword(): boolean {
        return this.providedPassword === this.settings.password || !this.settings.password;
    }

    private askForPassword(): void {
        const passwordMenu = document.getElementById("password-menu");
        passwordMenu.style.display = "flex";

        fromEvent(document.getElementById("password-input"), "keyup").pipe(
            pluck("target"),
            pluck("value"),
            debounceTime(500))
            .subscribe((password: string) => {
                this.providedPassword = password;
                if (this.checkPassword()) {
                    passwordMenu.style.display = "none";
                    this.showSettigns();
                } else {
                    document.getElementById("password-error").innerText = "Password incorrect";
                }
            });
    }

    private showSettigns(): void {
        this.displayGeneralSettings();
        this.watchGeneralSettings();
    }

    private displayGeneralSettings(): void {
        const optionsMenu = document.getElementById("options-menu");
        optionsMenu.style.display = "flex";
        this.passwordInput.value = this.settings.password;
        this.blockDialogImage.value = this.settings.blockDialog.image;
        this.blockDialogText.value = this.settings.blockDialog.text;
        if (this.settings.checkDescription) {
            this.checkDescription.checked = true;
        }
        this.displayBlockOptions():
        this.displayBlockDialogPreview();
    }

    private watchGeneralSettings(): void {
        this.watchPasswordField();
        this.watchBlockOptions();
        this.watchCheckDescription();
        this.watchBlockDialog();
        this.watchImportSettings();
        this.watchExportSettings();
    }

    private watchPasswordField(): void {
        fromEvent(this.passwordInput, "keyup").pipe(
            pluck("target"),
            pluck("value"),
            debounceTime(500))
            .subscribe(async (newPassword: string) => {
                this.settings.password = newPassword;
                await this.settings.save();
            });
    }

    private watchBlockOptions(): void {
        fromEvent(document.getElementsByClassName("segmented-control"), "click")
            .pipe(
                filter((x) => x.target instanceof HTMLLabelElement),
                pluck("target"),
                pluck("dataset"))
            .subscribe(async (dataset: { value: string, subject: string }) => {
                const value = dataset.value;
                const subject = dataset.subject;
                await this.blockOptionChanged(subject, value);
            });
    }

    private async blockOptionChanged(subject: string, value: string): Promise<void> {
        const blockAction: BlockAction = this.getBlockAction(value);
        const page: YouTubePage = this.getYouTubePage(subject);
        this.settings.blockOptions.set(page, blockAction);
        await this.settings.save();
    }

    private getBlockAction(action: string): BlockAction {
        switch (action) {
            case "Block":
                return BlockAction.Block;
            case "Remove":
                return BlockAction.Remove;
            case "Redirect":
                return BlockAction.Redirect;
            default:
                return BlockAction.Nothing;
        }
    }

    private getYouTubePage(page: string): YouTubePage {
        switch (page) {
            case "Channel":
                return YouTubePage.Channel;
            case "Frontapge":
                return YouTubePage.Frontpage;
            case "Search":
                return YouTubePage.Search;
            case "Subscriptions":
                return YouTubePage.Subscriptions;
            case "Trending":
                return YouTubePage.Trending;
            case "Video":
                return YouTubePage.Video;
            default:
                return YouTubePage.Undetermined;
        }
    }

    private watchCheckDescription(): void {
        fromEvent(this.checkDescription, "click")
            .pipe(pluck("target"))
            .subscribe(async (checkbox: HTMLInputElement) => {
                this.settings.checkDescription = checkbox.checked;
                await this.settings.save();
            });
    }

    private watchBlockDialog(): void {
        fromEvent(this.blockDialogText, "keyup").pipe(
            pluck("target"),
            pluck("value"),
            debounceTime(500))
            .subscribe(async (value: string) => {
                this.settings.blockDialog.text = value;
                await this.settings.save();
                this.displayBlockDialogPreview();
            });
        fromEvent(this.blockDialogImage, "keyup").pipe(
            pluck("target"),
            pluck("value"),
            debounceTime(500))
            .subscribe(async (value: string) => {
                this.settings.blockDialog.image = value;
                await this.settings.save();
                this.displayBlockDialogPreview();
            });
    }

    private displayBlockOptions(): void {
        const blockOptions = this.settings.blockOptions;
    }

    private displayBlockDialogPreview(): void {
        this.blockDialogPreview
            .replaceChild(this.settings.blockDialog.getElement(), this.blockDialogPreview.childNodes[0]);
    }

    private watchImportSettings(): void {
        fromEvent(this.importFileInput, "change").pipe(
            mergeMap((event: Event) => from((event.target as HTMLInputElement).files)),
            filter((file: File) => file.type.match("application/json") !== null),
            mergeMap((file: File) => {
                const fileReader = new FileReader();
                const observable = Observable.create((observer: any) => {
                    fileReader.onload = () => {
                        observer.next(fileReader.result);
                        observer.complete();
                    };
                });
                fileReader.readAsText(file);
                return observable;
            }))
            .subscribe(async (contents: string) => {
                const importedSettings = JSON.parse(contents);
                this.settings = Settings.fromImportedSettings(importedSettings);
                await this.settings.save();
                location.reload();
            });

        fromEvent(this.importSettings, "click").subscribe(() => {
            this.importFileInput.click();
        });
    }

    private watchExportSettings(): void {
        fromEvent(this.exportSettings, "click").subscribe(() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.settings));
            const downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "keywordblocker-settings.json");
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }
}
