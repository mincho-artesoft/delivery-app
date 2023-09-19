import { AfterViewInit, Component, Input, OnDestroy, OnInit, effect } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicService } from '../../services/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseExtendedFormGroup } from '../../extends/base-extended-form-group';


@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit, OnDestroy {
  @Input('settings') settings: any;
  @Input('formGroup') formGroup!: BaseExtendedFormGroup;
  id: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    public dynamicService: DynamicService,
  ) { }

  ngOnInit(): void {
    console.log('Dynamic component is initialized!')
    // if (!this.settings) {
    //   this.route.url.pipe(
    //     takeUntil(this.destroy$)
    //   ).subscribe((url: any) => {
    //     let segments = this.router.parseUrl(this.router.url).root.children['primary'].segments
    //     if (segments[1] && segments[1].path !== 'edit') {
    //       this.id = segments[1].path
    //     } else {
    //       this.unsubscriber.next();
    //       this.id = '';
    //     }
    //     const newRoute = this.router.url;
    //     if (newRoute !== this.currentRoute) {
    //       this.currentRoute = newRoute;
    //       this.formGroup = this.dynamicService.formGroupProvider()
    //       this.settings = this.formGroup.htmlSettings
    //     }
    //     if (this.id) {
    //       const path = this.id;
    //       const url = this.settings.get.Yget.replace("${path}", path); "/organization?path="
    //       this.http.request('Yget', url).pipe(takeUntil(this.unsubscriber)).subscribe((res: any) => {
    //         const data = JSON.parse(res);
    //         console.log(data.structure);
            
    //         this.formGroup.fillFormWithResponse(data.structure)
    //       })
    //     }
    //   });
    }
    
  }

  ngOnDestroy(): void {
    console.log('Dynamic component is destroyed!')
  }


  submit() {
    this.validateAndParseNumbers(this.settings.columns, this.formGroup);
    this.http.post(this.settings.update.url, this.formGroup.getRawValue()).subscribe((res: any) => {
      console.log(res)
    })
  }

  validateAndParseNumbers(columnSettings: any[], formGroup: FormGroup) {
    columnSettings.forEach(setting => {
      if (setting.validators && setting.validators.some((v: any) => v.name === 'number')) {
        if (formGroup.contains(setting.data)) {
          const value = formGroup.get(setting.data)?.value;
          if (value !== null && value !== undefined) {
            formGroup.get(setting.data)?.setValue(parseInt(value, 10));
          }
        }
      }
      if (setting.cells) {
        this.validateAndParseNumbers(setting.cells, formGroup);
      }
    });
  }

  
  getBaseExtendedFormGroup(parent: string, lang: string): BaseExtendedFormGroup {
    return this.formGroup.get(parent)?.get(lang) as BaseExtendedFormGroup;
  }


  toggleLang(lang: any, cell: any) {
   this.formGroup.toggleLang(lang)
  }


  trackByCountryCode(index: number, country: any): string {
    return country.code;
  }

  getColumns(column: any, lang: any) {
    let arr: any = []
    column.columns.map((cell: any) => {
      if(cell.data.indexOf(lang) > -1){
        arr.push(cell)
      }
    })
    let returnValue = {...column};
    returnValue.columns = arr
    return returnValue;
  }
}
