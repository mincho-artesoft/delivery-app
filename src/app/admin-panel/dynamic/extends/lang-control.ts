import { ValidatorFn, Validators } from "@angular/forms";
import { BaseControl } from "./base-control";
import { BehaviorSubject } from "rxjs";

const validatorMapping: { [key: string]: any } = {
    'minLength': (arg: any) => Validators.minLength(arg),
    'maxLength': (arg: any) => Validators.maxLength(arg),
    'required': () => Validators.required,
    'email': () => Validators.email,
    'number': () => Validators.pattern('^[0-9]*$'),
    'pattern': (arg: any) => Validators.pattern(arg),
};



export class LangControl extends BaseControl {
    public activeLang = new BehaviorSubject<string>('NL');
    constructor(
        cell: any, value?: any
    ) {

        super({ value: value || (cell.default || '') });
    }
    toggleLang(lang: any) {
        this.activeLang.next(lang);
    }
}


