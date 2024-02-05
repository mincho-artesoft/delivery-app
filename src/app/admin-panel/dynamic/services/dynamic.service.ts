import { CdkDropList } from '@angular/cdk/drag-drop';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { InterpolateService } from './interpolate.service';
import { BaseExtendedFormGroup } from '../extends/base-extended-form-group';
import { ADMIN_PANEL_SETTINGS } from '../../admin-panel-settings';

@Injectable({
  providedIn: 'root'
})
export class DynamicService {
  itemToDrop: any;
  dropLists: any = [];
  formGroupProvider = signal<any>('');
  formArrayProvider = signal<any>('');
  lastSelectedRow: any;
  lastSelectedFormGroup: BaseExtendedFormGroup;
  openSidenav = new BehaviorSubject(false);
  isSidenavOpen: boolean = false;
  public cellWidths: number[] = [];
  public cellWidthsChanged = new Subject<number[]>();
  unsubscribeOnNavigation = new Subject<any>();
  selectedOrganization = new FormControl<any>({});
  serviceGuid: any;
  public view: string = 'table';
  action: any;
  interpolateData: any;
  defaultSettings = [];
  redirected: boolean = false;
  mainGrid: boolean = false;
  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private http: HttpClient) {
    this.selectedOrganization.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => {
        return prev._id === curr._id;
      })
    ).subscribe((change: any) => {
      // this.refreshPage();
    })
    ADMIN_PANEL_SETTINGS.pages.map(page => {
      if (page.path.includes('organizations')) {
        this.defaultSettings.push(page);
      }
    });
  }



  setCellWidths(widths: number[]) {
    this.cellWidths = widths;
    // console.log(this.cellWidths)
    this.cellWidthsChanged.next(this.cellWidths);
  }

  getCellWidths() {
    return [...this.cellWidths];
  }


  register(dropList: CdkDropList) {
    this.dropLists.push(dropList);
  }


  generateRandomId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    if (!this.isSidenavOpen) {
      const rootRoute = `/${this.router.url.split('/')[1]}`;
      this.router.navigate([rootRoute]).then(() => {
        this.formGroupProvider.set(null)
      }).catch(error => {
        console.log('Navigation failed:', error);
      });
    }
  }


  isSidenavOpened(): boolean {
    return this.isSidenavOpen;
  }

  private openConfirmationDialog(data: any): Observable<boolean> {
    const { confirmation = {}, snackbarMessage = {} } = data.button;
    const width = confirmation.width || 400;
    const title = confirmation.title || 'Confirm Delete';
    const message = InterpolateService.suplant(confirmation.interpolate, data.control) || 'Are you sure you want to delete this item?';
    const confirmButtonText = confirmation.confirmText || 'Delete';
    const cancelButtonText = confirmation.cancelText || 'Cancel';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: `${width}px`,
      hasBackdrop: true,
      data: { title, message, confirmButtonText, cancelButtonText }
    });

    return dialogRef.afterClosed();
  }

  private deleteItem(data: any) {
    const button = data.button;
    const url = InterpolateService.suplant(button.deletePath, data.control);
    this.http.request('Ydelete', url).subscribe({
      next: (res: string) => {
        const response = JSON.parse(res);
        const message = button.snackbarMessage.interpolate ?
          InterpolateService.suplant(button.snackbarMessage.interpolate, data.control) :
          response.message || 'Successfully deleted';
        this.showSnackbar(message, button.snackbarMessage);
        const lastSelectedJSON = localStorage.getItem('lastSelectedRow');
        const selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization'));
        const stringControl = JSON.stringify(data.control?.getRawValue())
        if (stringControl === lastSelectedJSON) {
          localStorage.setItem('lastSelectedRow', '');
        }
        if (data.control.getRawValue()?._id === selectedOrg._id) {
          localStorage.setItem('selectedOrganization', '');
          localStorage.setItem('selectedService', '');
        }
      },
      error: (err) => {
        console.error('Deletion failed:', err);
        this.showSnackbar('Deletion failed. Please try again.', button.snackbarMessage);
      }
    });
  }

  private showSnackbar(message: string, snackbarData: any) {
    this.snackbar.open(message, 'Close', {
      duration: snackbarData.duration || 2000,
      horizontalPosition: snackbarData.horizontal || 'right',
      verticalPosition: snackbarData.vertical || 'top'
    });
  }

  navigateBasedOnConfiguration(data: any): void {
    const control = data.control;
    const button = data.button;
    if (!button.path.includes('.')) return;

    const segments = button.path.split('.');
    const baseSegment = segments[0];
    const actionSegment = segments[1];
    const id = this.determineId(control);

    const urlSegments = [baseSegment];
    if (id && button.action !== 'create') {
      const [param] = id.split('.');
      urlSegments.push(actionSegment, param);
    } else {
      urlSegments.push(actionSegment);
    }

    this.router.navigate(urlSegments);
  }

  private determineId(control): string | undefined {
    const rawValue = control?.getRawValue() || this.lastSelectedRow || this.lastSelectedFormGroup?.getRawValue();
    return rawValue?._id;
  }

  private handleSaveAction(data: any): void {
    const button = data.button;
    const control = data.control;
    if (!button.yPost) return;

    const path = this.determinePathForSave(button);
    const body = this.constructRequestBody(button, control);
    this.http.request('Ypost', path, body).subscribe({
      next: (res: any) => { this.handleSaveResponse(res, button, control, body) },
      error: (err) => console.error('Error on save:', err)
    });
  }

  private determinePathForSave(button: any): string {
    if (button.createServices) {
      return this.interpolateData.lastSelectedRow ?
        InterpolateService.suplant(button.yPost, this.interpolateData) :
        button.yPost.replace('${lastSelectedRow._id}', this.generateOrganizationId());
    } else if (button.yPost.guid) {
      return button.yPost.path;
    } else {
      return InterpolateService.suplant(button.yPost, this.interpolateData);
    }
  }

  private constructRequestBody(button: any, control: any): any {
    let guid = button.yPost.guid ? InterpolateService.suplant(button.yPost.guid, this.interpolateData) : null;
    const data = control.getRawValue();
    const body: any = {
      body: {
        data: data
      }
    }
    if (guid) {
      body.body = {
        ...data,
        guid: guid
      }
    }
    if (button.createServices && !data._id) {
      const settings: any = ADMIN_PANEL_SETTINGS.pages;
      body.body.data.settings = [];
      settings.map((page: any) => {
        if (page.path.includes('organizations')) {
          body.body.data.settings.push(page);
        }
      });
    }
    return body;
  }

  private handleSaveResponse(res: any, button: any, control: any, body: any): void {

    const data = JSON.parse(res);
    this.snackbar.open(data.message, 'Close', {
      duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    });
    if (button.createServices && !control.getRawValue()._id) {
      this.generateServices(data._id, services, body);
    }
    control.patchValue(data);
  }

  private generateServices(dataId: string, services: any[], body: any): void {
    services.forEach(service => {
      if (service.default) {
        this.http.request('Ypost', `/services?path=${dataId}`, { body: { settings: service, value: service.default } }).subscribe({
          next: ((res: string) => {
            const settings = ADMIN_PANEL_SETTINGS.pages;
            settings.map(page => {
              if (page.path.includes(service.data)) {
                body.body.data.settings.push(page);
              }
            });
            this.http.request('yPost', `/organization?path=${dataId}`, body).subscribe()
          }),
          error: (err) => console.error('Error generating service:', err)
        });
      }
    });
  }


  handleButtonActions(button: any, control?: any) {
    const dataContext = {
      button: button,
      control: control || this.lastSelectedFormGroup
    }
    if (button.action === 'delete') {
      this.openConfirmationDialog(dataContext).subscribe(result => {
        if (result) {
          this.deleteItem(dataContext);
        }
      });
    } else if (button.openSidenav) {
      this.navigateBasedOnConfiguration(dataContext)
    } else {
      switch (button.action) {
        case 'close':
          this.toggleSidenav();
          break;
        case 'save':
          if (button.addProduct) {
            console.log('product add', dataContext)
          }
          this.handleSaveAction(dataContext);

          break;
        default:
          console.warn('Action not recognized:', button.action);
      }
    }
  }

  refreshPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  generateOrganizationId() {
    return `${this.generateRandomId(5)}.${this.generateRandomId(20)}.organization`;
  }
}


const services = [
  {
    data: 'warehouse',
    title: 'Warehouse',
    default: 'base',
    validators: [{ name: 'required' }],
    options: [
      {
        name: 'Basic Subscription',
        description: {
          subtitle: 'Ideal for Small Scale Operations',
          usage: 'Inventory Limit: Manage up to 10 items.',
          features: [
            'Real-time inventory tracking for a concise product range.',
            'Basic analytics for inventory optimization.',
            'Access to essential warehouse management tools.',
            'Email support for queries and troubleshooting.'
          ],
          hint: '*Best for: Small businesses or startups with a limited range of products.'
        },
        value: 'base'
      },
      {
        name: 'Extended Subscription',
        description: {
          subtitle: 'Perfect for Growing Businesses',
          usage: 'Inventory Limit: Handle up to 30 items.',
          features: [
            'All Basic features included.',
            'Enhanced analytics with trend insights.',
            'Multi-user access for team collaboration.',
            'Priority email and chat support.'
          ],
          hint: '*Best For: Medium-sized businesses experiencing growth and diversifying their product range.'
        },
        value: 'extended'
      },
      {
        name: 'Full Subscription',
        description: {
          subtitle: 'Ultimate Solution for Large Operations',
          usage: 'Inventory Limit: Unlimited items management.',
          features: [
            'All Extended features included.',
            'Advanced inventory forecasting tools.',
            'Integration capabilities with other business systems (CRM, ERP).',
            'Dedicated account manager and 24/7 support.'
          ],
          hint: '*Best For: Large enterprises or rapidly expanding businesses needing comprehensive and scalable inventory solutions.'
        },
        value: 'full'
      }
    ]
  },
  {
    data: 'humanResources',
    title: 'Human Resources',
    default: 'base',
    validators: [{ name: 'required' }],
    options: [
      {
        name: 'HR - Max employees to 10',
        description: {
          subtitle: 'Efficient for Small Teams',
          usage: 'Maximum Employees: Up to 10.',
          features: [
            'Basic HR management tools.',
            'Employee records and attendance tracking.',
            'Standard reporting capabilities.',
            'Email support for HR queries.'
          ],
          hint: '*Ideal for: Small businesses or teams with up to 10 employees.'
        },
        value: 'base'
      },
      {
        name: 'HR - Max employees from 10 to 30',
        description: {
          subtitle: 'Optimized for Medium-sized Teams',
          usage: 'Maximum Employees: 10 to 30.',
          features: [
            'Enhanced HR management tools.',
            'Advanced employee scheduling and time tracking.',
            'Customizable reports and analytics.',
            'Priority email and chat support.'
          ],
          hint: '*Suitable for: Growing businesses with 10 to 30 employees.'
        },
        value: 'extended'
      },
      {
        name: 'HR - Max employees - unlimited',
        description: {
          subtitle: 'Comprehensive for Large Enterprises',
          usage: 'Maximum Employees: Unlimited.',
          features: [
            'Full-suite HR management system.',
            'Automated payroll and benefits administration.',
            'In-depth analytics and predictive insights.',
            'Dedicated HR support and consultation.'
          ],
          hint: '*Best For: Large enterprises or organizations with a large number of employees.'
        },
        value: 'full'
      }
    ]
  },
  {
    data: 'manageCooking',
    title: 'Manage Cooking',
    default: 'base',
    validators: [{ name: 'required' }],
    options: [
      {
        name: 'Create recipes',
        description: {
          subtitle: 'Efficient for Small Teams',
          usage: 'Maximum Recipes: Up to 10.',
          features: [
            'Basic recipes tools.',
          ],
          hint: '*Ideal for: Small organizations with up to 10 recipes and up to 10 employees.'
        },
        value: 'base'
      },
      {
        name: 'Create recipes and plan cooking schedule',
        description: {
          subtitle: 'Optimized for Medium-sized Teams',
          usage: 'Maximum Recipes: 10 to 30.',
          features: [
            'Enhanced recipes tools.',
            'Advanced cooking scheduling and time tracking.',
            'Schedule you plan cooking up to 10 days ahead'
          ],
          hint: '*Suitable for: Growing businesses with 10 to 30 employees.'
        },
        value: 'extended'
      },
      {
        name: 'Creates recipes and plan cooking schedule- unlimited',
        description: {
          subtitle: 'Comprehensive for Large Enterprises',
          usage: 'Maximum Recipes: Unlimited.',
          features: [
            'Full-suite recipes system.',
            'Unlimited future days of cooking schedule',
          ],
          hint: '*Best For: Large enterprises or organizations with a large number of employees.'
        },
        value: 'full'
      }
    ]
  }
]
