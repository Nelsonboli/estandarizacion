import { FormArray, FormGroup, ValidationErrors } from "@angular/forms";

export class FormUtils {

  static isvalidatorfiled(form: FormGroup, field: string): boolean | null {
    return (!!form.controls[field].errors && form.controls[field].touched);
  }

  static getTextError(errors: ValidationErrors){
        for (const key of Object.keys(errors)) {

      switch (key) {
        case 'required':
          return 'Este campo es obligatorio';
      }
    }
    return null;
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) {
      return null;
    }
    const errors = form.controls[fieldName].errors ?? {};
    return this.getTextError(errors)
  }

}