import { Component, Input } from '@angular/core';
import { BaseExtendedFormGroup } from '../../../extends/base-extended-form-group';
import { DynamicService } from '../../../services/dynamic.service';

@Component({
  selector: 'app-teams-editor',
  templateUrl: './teams-editor.component.html',
  styleUrls: ['./teams-editor.component.scss']
})
export class TeamsEditorComponent {
  @Input('formArray') formArray;
  @Input('settings') settings;
  selectedTeam: BaseExtendedFormGroup;

  constructor(private dynamicService: DynamicService) {

  }

  images = [
    'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg',
    'https://static.vecteezy.com/system/resources/previews/009/361/083/original/restaurant-logo-design-free-file-free-vector.jpg',
    'https://img.freepik.com/premium-vector/catering-quality-food-design-logo_187482-593.jpg',
    'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-logo%2Ccatering-logo%2Cspoon-logo-icon-design-template-2ce0a2137f418d6b4083ed268b3e2834_screen.jpg?ts=1663417865'
  ]

  onClick(btn: any) {
    if(this.selectedTeam) {
      this.dynamicService.handleButtonActions(btn, this.selectedTeam)
    }
  }

  clickTeam(ctrl: BaseExtendedFormGroup) {
    this.dynamicService.lastSelectedRow = ctrl.getRawValue();
    this.selectedTeam = ctrl
  }

}
