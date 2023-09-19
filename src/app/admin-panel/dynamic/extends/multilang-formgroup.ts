import { FormGroup } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { BaseExtendedFormGroup } from "./base-extended-form-group";
import { BehaviorSubject } from "rxjs";
import { BaseControl } from "./base-control";


export class MultilangFormGroup extends FormGroup {
  public activeLang = new BehaviorSubject<string>('NL');
  constructor(
    cell: any,
    private http: HttpClient,
    collectedData?: any,
  ) {
    const controls: { [key: string]: any } = {};
    if (cell.columns) {
      collectedData.languages.map((tab: any) => {
        controls[tab.code] = new BaseExtendedFormGroup(cell.columns, http, collectedData)
      })
    } else if (cell.editor === 'langLinked') {
      collectedData.languages.map((tab: any) => {
        controls[tab.code] = new BaseControl(cell)
      })

    } else {
      collectedData.languages.map((tab: any) => {
        controls[tab.code] = new BaseControl(cell)
      })
    }
    super(controls);
  }

  toggleLang(lang: any) {
    this.activeLang.next(lang);
  }
}







