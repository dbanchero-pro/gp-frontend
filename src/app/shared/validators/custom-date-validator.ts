import { ValidatorFn, AbstractControl } from "@angular/forms";

export class CustomDateValidators {
    static fromToDate(fromDateField: string, toDateField: string, errorName: string = "fromToDate"): ValidatorFn {
        return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
            const fromDateControl: AbstractControl | null = formGroup.get(fromDateField);
            let fromDate: any = fromDateControl?.value;
            if(fromDate !== null && fromDate !== "" && fromDate !== undefined){
                fromDate.setHours(0, 0, 0);
            }

            const toDateControl: AbstractControl | null = formGroup.get(toDateField);
            let toDate: any = toDateControl?.value;
            if(toDate !== null && toDate !== "" && toDate !== undefined){
                toDate.setHours(0, 0, 0);
            }

            if (toDateControl!=null && fromDateControl!=null) {
                toDateControl.setErrors(null);
            }

            if (toDateControl!=null && fromDateControl!=null
                && (fromDate !== null && toDate !== null && toDate !== ""
                && fromDate !== "" && fromDate !== undefined && toDate !== undefined)
                && fromDate > toDate) {
                toDateControl.setErrors({"fieldsMismatch": true});
                toDateControl.markAsTouched();
                fromDateControl.markAsTouched();
                toDateControl.markAsDirty();
                return {[errorName]: true};
            }
            return null;
        };
    }
}