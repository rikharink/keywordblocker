import { Settings } from "@options/models/settings";
import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";
import { fromEvent } from "rxjs/observable/fromEvent";
import { debounceTime } from "rxjs/operators/debounceTime";
import { filter } from "rxjs/operators/filter";
import { mergeMap } from "rxjs/operators/mergeMap";
import { pluck } from "rxjs/operators/pluck";

export class GeneralSettignsController {
    private settings: Settings;
    private providedPassword: string;

    private passwordInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    private removeFromResults: HTMLInputElement = document.getElementById("remove-from-results") as HTMLInputElement;
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
        if (this.settings.removeFromResults) {
            this.removeFromResults.checked = true;
        }
        this.displayBlockDialogPreview();
    }

    private watchGeneralSettings(): void {
        this.watchPasswordField();
        this.watchRemoveFromResults();
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

    private watchRemoveFromResults(): void {
        fromEvent(this.removeFromResults, "click")
            .pipe(pluck("target"))
            .subscribe(async (checkbox: HTMLInputElement) => {
                this.settings.removeFromResults = checkbox.checked;
                await this.settings.save();
            });
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
