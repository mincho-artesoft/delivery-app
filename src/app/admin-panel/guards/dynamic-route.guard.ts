import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, UrlTree } from "@angular/router";
import { Observable, firstValueFrom, forkJoin, of } from "rxjs";
import { catchError, first } from "rxjs/operators";
import { DynamicService } from "../dynamic/services/dynamic.service";
import { BaseExtendedFormGroup } from "../dynamic/extends/base-extended-form-group";
import { HttpClient } from "@angular/common/http";
import { BaseExtendedFormArray } from "../dynamic/extends/base-extended-form-array";
import { InterpolateService } from "../dynamic/services/interpolate.service";
import { YjsService } from "src/app/yjs.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ADMIN_PANEL_SETTINGS } from "../admin-panel-settings";

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
    private yjsService: YjsService,
    private snackbar: MatSnackBar
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    let searchPath: string;
    let redirectToEdit: boolean = false;
    this.restoreStateFromLocalStorage();

    if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
      searchPath = route.params['primary'];
    } else {
      searchPath = `${route.parent?.params['primary']}.${route.params['secondary'] || route.params['id']}`;
    }
    const settings = await new Promise<any>((resolve) => {
      this.getSettingsBasedOnRoute(searchPath, (error, result, shouldRedirectToEdit) => {
        redirectToEdit = shouldRedirectToEdit;
        resolve(result);
      });
    });
    if (redirectToEdit) {
      if (!searchPath.includes('organizations')) {
        setTimeout(() => {
          this.snackbar.open('You must create at least 1 organization', 'Close', {
            duration: 4000, horizontalPosition: 'right', verticalPosition: 'top'
          });
        }, 1500);
        return this.router.parseUrl('/organizations/edit');
      } else {
        if (!this.dynamicService.redirected) {
          this.dynamicService.redirected = true;
          setTimeout(() => {
            this.dynamicService.redirected = false;
          }, 500);
          return this.router.parseUrl('/organizations/edit');
        }
      }

    }
    if (settings) {
      if (route.params['primary'] && !route.params['id'] && !route.params['secondary']) {
        this.dynamicService.formArrayProvider.set(null);
        if (this.yjsService.connected) {
          this.fetchData(settings);
        } else {
          this.yjsService.onConnected.pipe(first()).subscribe({
            next: async () => {
              this.fetchData(settings);
            },
            error: (error) => console.error("Subscription error:", error),
          });
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
            if (this.yjsService.connected) {
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
              this.yjsService.onConnected.pipe(first()).subscribe({
                next: async () => {
                  try {
                    const collectedData = await this.extractAndManipulateData(settings?.options);
                    const path = settings.yGet.interpolate ? InterpolateService.suplant(settings.yGet.interpolate, this.dynamicService.interpolateData) : settings.yGet.path;
                    console.log(path)
                    const res: any = await firstValueFrom(this.http.request('Yget', path))
                    this.updateFormGroup(settings, collectedData, JSON.parse(res).structure || null);
                    this.dynamicService.formGroupProvider.set(this.formGroup);
                    return true;
                  } catch (error) {
                    console.error("Failed to fetch data:", error);
                    return false;
                  }
                },
                error: (error) => console.error("Subscription error:", error),
              });
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

  async fetchData(settings) {
    try {
      const path = settings.yGet.interpolate
        ? InterpolateService.suplant(settings.yGet.interpolate, this.dynamicService.interpolateData)
        : settings.yGet.path;
      console.log(path)
      const res: any = await firstValueFrom(this.http.request('Yget', path));
      console.log(JSON.parse(res).structure)
      this.formArray = new BaseExtendedFormArray(settings, this.http, this.dynamicService, null, JSON.parse(res).structure);
      this.dynamicService.formArrayProvider.set(this.formArray);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }


  private getSettingsBasedOnRoute(searchPath: any, callback: (error: Error | null, settings?: any, shouldRedirectToEdit?: boolean) => void) {
    if (this.dynamicService.interpolateData.selectedOrganization?.settings) {
      if (this.yjsService.connected) {
        const settings = this.dynamicService.interpolateData.selectedOrganization?.settings;
        const foundSetting = settings.find((page: any) => page.path === searchPath);
        callback(null, foundSetting);
      } else {
        this.yjsService.onConnected.pipe(first()).subscribe({
          next: () => {
            try {
              const settings = this.dynamicService.interpolateData.selectedOrganization?.settings;
              const foundSetting = settings.find((page: any) => page.path === searchPath);
              callback(null, foundSetting);
            } catch (error) {
              console.error("Failed to connect:", error);
              callback(error);
            }
          },
          error: (error) => {
            console.error("Subscription error:", error);
            callback(error);
          },
        });
      }
    } else {
      const settings = this.dynamicService.defaultSettings;
      if(this.dynamicService.redirected && !this.dynamicService.mainGrid){
        searchPath = 'organizations.edit'
      }
      if(searchPath === 'organizations') {
        this.dynamicService.mainGrid = true;
        setTimeout(() => {
          this.snackbar.open('You must create at least 1 organization', 'Close', {
            duration: 4000, horizontalPosition: 'right', verticalPosition: 'top'
          });
        }, 1500);
      }
      if(!searchPath.includes('organizations')){
        searchPath = 'organizations.edit'
      }
      console.log(searchPath, this.dynamicService['counter'])
      const foundSetting = settings?.find((page: any) => page.path === searchPath);
      if (foundSetting) {
        callback(null, foundSetting, true);
      } else {
        callback(new Error("No settings found in selected organization."));
      }
    }
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
    this.formGroup = new BaseExtendedFormGroup(deepCopy, this.http, this.dynamicService, collectedData, value || null, true);
    this.dynamicService.formGroupProvider.set(this.formGroup);
    this.dynamicService.toggleSidenav();
  }

  restoreStateFromLocalStorage() {
    if (!this.dynamicService.selectedOrganization.value._id) {
      const returnToOrgJSON = localStorage.getItem('selectedOrganization');
      if (returnToOrgJSON && returnToOrgJSON !== 'undefined') {
        try {
          const returnToOrg = JSON.parse(returnToOrgJSON);
          this.dynamicService.selectedOrganization.setValue(returnToOrg, { emitEvent: false });
        } catch (e) {
          console.error("Error parsing selected organization from localStorage:", e);
        }
      }
    }

    if (!this.dynamicService.serviceGuid) {
      const returnToServiceJSON = localStorage.getItem('selectedService');
      if (returnToServiceJSON && returnToServiceJSON !== 'undefined') {
        try {
          const returnToService = JSON.parse(returnToServiceJSON);
          this.dynamicService.serviceGuid = returnToService;
        } catch (e) {
          console.error("Error parsing selected service from localStorage:", e);
        }
      }
    }

    if (!this.dynamicService.lastSelectedRow) {
      const returnToLastSelectedJSON = localStorage.getItem('lastSelectedRow');
      if (returnToLastSelectedJSON && returnToLastSelectedJSON !== 'undefined') {
        try {
          const returnToLastSelected = JSON.parse(returnToLastSelectedJSON);
          this.dynamicService.lastSelectedRow = returnToLastSelected;
        } catch (e) {
          console.error("Error parsing last selected row from localStorage:", e);
        }
      }
    }

    this.dynamicService.interpolateData = {
      ...this.dynamicService.interpolateData,
      selectedOrganization: this.dynamicService.selectedOrganization.value,
      lastSelectedRow: this.dynamicService.lastSelectedRow,
      serviceGuid: this.dynamicService.serviceGuid
    };
  }

}