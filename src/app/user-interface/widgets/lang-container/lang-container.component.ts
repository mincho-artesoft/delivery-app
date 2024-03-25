import { Component } from '@angular/core';
import { SharedService } from 'src/app/user-interface/services/shared.service';

@Component({
  selector: 'app-lang-container',
  templateUrl: './lang-container.component.html',
  styleUrls: ['./lang-container.component.scss']
})
export class LangContainerComponent {
  get halfLength() {
    return Math.ceil(this.languages.length / 2);
  }
  constructor(
    public sharedService: SharedService
  ) {

  }
  languageMenuVisible: boolean = false;
  languages: any[] =  [
    { code: 'BG', name: 'Bulgarian', flag: '../../../assets/images/BG.svg' },
    { code: 'EN', name: 'English', flag: '../../../assets/images/EN.svg' },
    { code: 'FR', name: 'French', flag: '../../../assets/images/FR.svg' },
    { code: 'IT', name: 'Italian', flag: '../../../assets/images/IT.svg' },
  ];

  toggleLanguageMenu() {
    this.languageMenuVisible = !this.languageMenuVisible;

  }

  selectLanguage(code: string) {
    this.sharedService.languageControl.patchValue(code)
    this.toggleLanguageMenu();
  }


}
