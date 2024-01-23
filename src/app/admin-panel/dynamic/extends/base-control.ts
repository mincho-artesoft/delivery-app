import { AsyncValidatorFn, FormControl, ValidatorFn, Validators } from "@angular/forms";
import { BaseExtendedFormGroup } from "./base-extended-form-group";
import { InterpolateValidator } from "./validators/interpolate-validator";
import { productAvailabilityValidator } from "./validators/product-validator";

const validatorMapping: { [key: string]: any } = {
  'minLength': (arg: any) => Validators.minLength(arg),
  'maxLength': (arg: any) => Validators.maxLength(arg),
  'required': () => Validators.required,
  'email': () => Validators.email,
  'number': () => Validators.pattern('^[0-9]*$'),
  'pattern': (arg: any) => Validators.pattern(arg),
  'productValidator': productAvailabilityValidator
};



export class BaseControl extends FormControl {
  constructor(
    cell: any, value?: any
  ) {
    let validators: ValidatorFn[] = [];
    let isReadOnly = cell.readOnly || false;
    if (cell.validators) {
      cell.validators.forEach((validator: any) => {
        if (validatorMapping[validator.name]) {
          if (validator.arg) {
            validators.push(validatorMapping[validator.name](validator.arg));
          } else {
            validators.push(validatorMapping[validator.name]);
          }
        }
      });
    }
    super({ value: value || (cell?.hasOwnProperty('default') ? cell.default : ''), disabled: isReadOnly }, validators);
  }

  setupAutopopulate(path: string, rootFormGroup: BaseExtendedFormGroup): void {
    const targetControl = rootFormGroup.findControlByPath(path);
    if (!targetControl) {
      console.error(`Cannot find control with path: ${path}`);
      return;
    }

    this.valueChanges.subscribe(value => {
      targetControl.setValue(value, { emitEvent: false });
    });
  }

  setupValidator(data: any): void {
    const asyncValidator = InterpolateValidator.interpolate(data);
    this.setAsyncValidators(asyncValidator);
  }
  setupAutoDisable(path: string, rootFormGroup: BaseExtendedFormGroup): void {
    const targetControl = rootFormGroup.findControlByPath(path);
    if (!targetControl) {
      console.error(`Cannot find control with path: ${path}`);
      return;
    }
    if (!targetControl.getRawValue()) {
      this.disable({ emitEvent: false })
    } else {
      this.enable({ emitEvent: false });
    }
    targetControl.root.valueChanges.subscribe(value => {
      if (!targetControl.root.getRawValue()[path]) {
        this.disable({ emitEvent: false });
      } else {
        this.enable({ emitEvent: false });
      }
    });
  }

}


