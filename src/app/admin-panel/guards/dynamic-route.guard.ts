import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, UrlTree } from "@angular/router";
import { Observable, firstValueFrom, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ADMIN_PANEL_SETTINGS } from "../admin-panel-settings";
import { DynamicService } from "../dynamic/services/dynamic.service";
import { BaseExtendedFormGroup } from "../dynamic/extends/base-extended-form-group";
import { HttpClient } from "@angular/common/http";
import { BaseExtendedFormArray } from "../dynamic/extends/base-extended-form-array";
import { InterpolateService } from "../dynamic/services/interpolate.service";

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
    public http: HttpClient,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    let searchPath: string;
    this.dynamicService.interpolateData = {
      selectedOrganization: this.dynamicService.selectedOrganization.value,
      lastSelectedRow: this.dynamicService.lastSelectedRow,
      serviceGuid: this.dynamicService.serviceGuid
    }
    if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
      searchPath = route.params['primary'];
    } else {
      searchPath = `${route.parent?.params['primary']}.${route.params['secondary'] || route.params['id']}`;
    }
    const settings: any = this.getSettingsBasedOnRoute(searchPath);
    if (!this.dynamicService.selectedOrganization.value?._id) {
      let selectedOrg;
      try {
        selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization'));
      } catch (e) {
        console.error('Error parsing JSON from localStorage', e);
        // Handle the error or set a default value
        selectedOrg = null;
      }
      if (selectedOrg) {
        this.dynamicService.selectedOrganization.patchValue(selectedOrg, { emitEvent: false })
      }
    }
    if (settings) {
      if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
        this.dynamicService.formArrayProvider.set(null);
        try {
          const path = settings.yGet.interpolate ? InterpolateService.suplant(settings.yGet.interpolate, this.dynamicService.interpolateData) : settings.yGet.path;
          const res: any = await firstValueFrom(this.http.request('Yget', path));
          console.log(JSON.parse(res).structure)
          this.formArray = new BaseExtendedFormArray(settings, this.http, null, JSON.parse(res).structure);
          this.dynamicService.formArrayProvider.set(this.formArray);

        } catch (error) {
          console.error("Failed to fetch data:", error);
          return false;
        }
      } else {
        const { id, secondary } = route.params;
        const primary = route.parent?.params['primary'];
        this.newView = route.params['primary'] || `${route.parent?.params['primary']}.${route.params['secondary'] || route.params['id']}`;
        if (id === "''" && !secondary) {
          return this.router.parseUrl(primary ?? '');
        }

        if (id || secondary === 'edit') {
          if (id) {
            try {
              const collectedData = await this.extractAndManipulateData(settings?.options);
              const path = settings.yGet.interpolate ? InterpolateService.suplant(settings.yGet.interpolate, this.dynamicService.interpolateData) : settings.yGet.path;
              const res: any = await firstValueFrom(this.http.request('Yget', path))
              this.updateFormGroup(settings, collectedData, JSON.parse(res).structure || null);
              this.dynamicService.formGroupProvider.set(this.formGroup);
            } catch (error) {
              console.error("Failed to fetch data:", error);
              return false;
            }
          } else {
            const collectedData = await this.extractAndManipulateData(settings?.options);
            this.updateFormGroup(settings, collectedData);
            this.dynamicService.interpolateData.lastSelectedRow = null;
          }

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

  private updateFormGroup(settings: any, collectedData: any, value?: any) {
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
    this.formGroup = new BaseExtendedFormGroup(deepCopy, this.http, collectedData, value || null, true);
    this.dynamicService.formGroupProvider.set(this.formGroup);
    this.dynamicService.toggleSidenav();
  }
}