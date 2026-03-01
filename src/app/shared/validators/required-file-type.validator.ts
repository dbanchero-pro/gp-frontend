import { AbstractControl, ValidatorFn } from '@angular/forms';

export function requiredFileType(type: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const file: string | null = control.value;
        if (file) {
            const parts: any = file.split('.');
            const extension: any = parts.slice(-1).pop().toLowerCase();
            let encontre: any = null;
            type.split(',').forEach((typ) => {
                if (
                    typ.toLowerCase() !== extension.toLowerCase() &&
                    parts.length > 1
                ) {
                    encontre = { requiredFileType: true };
                }
            });
            return encontre;
        }
        return null;
    };
}
