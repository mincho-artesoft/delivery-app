import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, UrlTree } from "@angular/router";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ADMIN_PANEL_SETTINGS } from "../admin-panel-settings";
import { DynamicService } from "../dynamic/services/dynamic.service";
import { BaseExtendedFormGroup } from "../dynamic/extends/base-extended-form-group";
import { HttpClient } from "@angular/common/http";
import { BaseExtendedFormArray } from "../dynamic/extends/base-extended-form-array";

@Injectable({
  providedIn: 'root'
})
export class DynamicRouteGuard {
  formGroup!: BaseExtendedFormGroup;
  formArray!: BaseExtendedFormArray;
  newView: any;
  constructor(
    private router: Router,
    public dynamicService: DynamicService,
    public http: HttpClient
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    let searchPath: string;

    if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
      searchPath = route.params['primary'];
    } else {
      searchPath = `${route.parent?.params['primary']}.${route.params['secondary'] || route.params['id']}`;
    }

    let settings: any = this.getSettingsBasedOnRoute(searchPath);
    if (settings) {
      if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
        this.dynamicService.formArrayProvider.set(null);
        this.http.request('Yget', settings.yGet).subscribe((res: any) => {
          console.log(res)
        })
        this.formArray = new BaseExtendedFormArray(settings, this.http, null);
        this.dynamicService.formArrayProvider.set(this.formArray);
        return true;
      } else {
        const { id, secondary } = route.params;
        const primary = route.parent?.params['primary'];
        this.newView = route.params['primary'] || `${route.parent?.params['primary']}.${route.params['secondary'] || route.params['id']}`;
        if (id === "''" && !secondary) {
          return this.router.parseUrl(primary ?? '');
        }

        if (id || secondary === 'edit') {
          // TODO request and get the record create a form with value for edit
          const collectedData = await this.extractAndManipulateData(settings?.options);
          this.updateFormGroup(settings, collectedData);
        }
      }
    }
    return true;
  }

  private getSettingsBasedOnRoute(searchPath: any) {
    let settings;
    ADMIN_PANEL_SETTINGS.pages.map((page: any) => {
      if (page.path === searchPath) {
        return settings = page;
      }
    })
    return settings;
  }

  private async extractAndManipulateData(options: any): Promise<any> {
    let collectedData: any = {};

    if (!options) {
      return { languages: this.getDefaultLanguages() };
    }

    const httpRequests = this.createHttpRequests(options);

    if (httpRequests.length > 0) {
      try {
        const responses: any = await forkJoin(httpRequests).toPromise();
        collectedData = this.mapResponsesToData(options, responses);
      } catch (error) {
        console.error('Some requests failed', error);
      }
    }

    collectedData.languages = this.getDefaultLanguages();
    return collectedData;
  }

  private createHttpRequests(options: any): Observable<any>[] {
    const httpRequests: Observable<any>[] = [];

    Object.keys(options).forEach((key: any) => {
      if (options[key]?.http) {
        const request = this.http.get(options[key]?.interpolate).pipe(
          catchError((error) => {
            console.error(`Request for key ${key} failed. Using empty array as fallback.`, error);
            return of([]);
          })
        );
        httpRequests.push(request);
      }
    });

    return httpRequests;
  }

  private mapResponsesToData(options: any, responses: any[]): any {
    const collectedData: any = {};

    Object.keys(options).forEach((key, index) => {
      collectedData[key] = responses[index];
    });

    return collectedData;
  }

  private getDefaultLanguages() {
    return [
      { code: 'IN', name: 'India', flag: '../../../assets/images/IN.svg' },
      { code: 'US', name: 'United States', flag: '../../../assets/images/US.svg' },
      { code: 'GB-ENG', name: 'England', flag: '../../../assets/images/US.svg' },
      { code: 'NL', name: 'Netherlands', flag: '../../../assets/images/NL.svg' },
    ];
  }

  private updateFormGroup(settings: any, collectedData: any) {
    let deepCopy = JSON.parse(JSON.stringify(settings))
    deepCopy.columns.forEach((cell: any) => {
      if (cell.editor && ['langLinked', 'multiLang'].indexOf(cell.editor) > -1) {
        if (cell.columns) {
          let newColumns: any = [];
          cell.columns.forEach((xCell: any) => {
            let arr = collectedData.languages.map((lang: any) => {
              return {
                title: `${xCell.title} (${lang.name})`,
                data: `${lang.code}.${xCell.data}`
              };
            });
            newColumns = newColumns.concat(arr);
          });
          cell.columns = newColumns;
        } else if (cell.editor === 'langLinked') {
          let arr = collectedData.languages.map((lang: any) => {
            return {
              title: `${cell.title} (${lang.name})`,
              data: `${lang.code}`
            };
          });
          cell.columns = arr;
        }
      }
    });
    this.formGroup = new BaseExtendedFormGroup(deepCopy, this.http, collectedData, null, true);
    this.dynamicService.formGroupProvider.set(this.formGroup);
    this.dynamicService.toggleSidenav();
  }
}