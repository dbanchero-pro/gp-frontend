import {Injectable, EventEmitter} from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class ReqErrorHandlerService {
    evShowError = new EventEmitter<string>();

    show(errorMessage: string): void {
        console.error(errorMessage);
        this.evShowError.emit(errorMessage);
    }
}
