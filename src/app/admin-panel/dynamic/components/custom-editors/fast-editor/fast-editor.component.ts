import { Component, Input } from '@angular/core';
import { BaseExtendedFormGroup } from '../../../extends/base-extended-form-group';
import { DynamicService } from '../../../services/dynamic.service';

@Component({
  selector: 'app-fast-editor',
  templateUrl: './fast-editor.component.html',
  styleUrls: ['./fast-editor.component.scss']
})
export class FastEditorComponent {
  @Input('rowControl') rowControl:  BaseExtendedFormGroup | any;
  @Input('cell') cell: any;
  editorVisible = false;
  constructor(public dynamicService: DynamicService) {
    
  }

  getErrors(errors: any) {
    return Object.values(errors)
  }


}
