import { CdkDropList } from '@angular/cdk/drag-drop';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, distinctUntilChanged } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { InterpolateService } from './interpolate.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicService {
  itemToDrop: any;
  dropLists: any = [];
  formGroupProvider = signal<any>('');
  formArrayProvider = signal<any>('');
  lastSelectedRow: any;
  openSidenav = new BehaviorSubject(false);
  isSidenavOpen: boolean = false;
  private dataSource = new BehaviorSubject<any>({ mainMenu: [] });
  data = this.dataSource.asObservable();
  public cellWidths: number[] = [];
  public cellWidthsChanged = new Subject<number[]>();
  unsubscribeOnNavigation = new Subject<any>();
  selectedOrganization = new FormControl<any>({});
  serviceGuid: any;
  public view: string = 'table';
  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private interpolateService: InterpolateService) {
    this.selectedOrganization.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => {
        return prev._id === curr._id;
      })
    ).subscribe((change: any) => {
      this.refreshPage();
    })
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

  interpolate(str: any, data: any, separator = ',') {
    return str.replace(/\$\{(\w+)\}/g, (match: any, key: any) => {
      if (Array.isArray(data)) {
        return data.map(item => item[key]).join(separator);
      }
      return data[key];
    });
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

  handleButtonActions(button: any, control?: any) {
    if (button.isDialog) {
      if (button.deletePath) {
        let message = this.interpolate(button.message, control?.getRawValue() || this.lastSelectedRow);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '460px',
          hasBackdrop: true,
          data: {
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this item?',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const url = this.interpolate(button.deletePath, { ...control?.getRawValue() || this.lastSelectedRow });
            this.http.request('Ydelete', url).subscribe((res: string) => {
              const data = JSON.parse(res);
              this.snackbar.open(data.message || "Deleted", 'Close', {
                duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
              })
            })
          }
        });
      }
    } else if (button.openSidenav) {
      if (button.path.indexOf('.') > -1) {
        let params = button.path.split('.');
        let id = control ? control.getRawValue()._id : this.lastSelectedRow?._id;
        let urlSegments = [params[0]];
        if (id && button.action !== 'create') {
          const [param, b, c] = id.split(".");
          urlSegments.push(button.path.split('.')[1], param);
        } else {
          urlSegments.push(button.path.split('.')[1]);
        }
        this.router.navigate(urlSegments);
      }
    } else {
      if (button.action === 'close') {
        this.toggleSidenav()
      } else if (button.action === 'save') {
        if (button.yPost) {
          const values = {
            lastSelectedRow: this.lastSelectedRow,
            selectedOrganization: this.selectedOrganization.value
          }
          let path;
          if(button.createServices) {
            if (this.lastSelectedRow) {
              path = InterpolateService.suplant(button.yPost, this);
            } else {
              path = button.yPost.replace('${lastSelectedRow._id}', `${this.generateRandomId(5)}.${this.generateRandomId(20)}.organization`);
            }
          } else {
            path = InterpolateService.suplant(button.yPost, this);
          }
          
          console.log(path)
          this.http.request('Ypost', `${path}`, { body: { data: control.getRawValue() } }).subscribe((res: any) => {
            console.log(JSON.parse(res));
            const generateServices = button.createServices && !control.getRawValue()._id;
            const data = JSON.parse(res);
            control.patchValue(data.data);
            this.snackbar.open(data.message, 'Close', {
              duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            });
            // This creates services when we create a new organization
            if (generateServices) {
              services.map((service: any) => {
                if (service.default) {
                  this.http.request('Ypost', `/services?path=${data._id}`, { body: { settings: service, value: service.default } }).subscribe((res: string) => {
                    console.log(res)
                  });
                }
              });
            }
          })
        } else if (button.http) {
          const data = {
            ...control.getRawValue(),
            guid: this.selectedOrganization.value._id
          }
          this.http.post(button.http.path, data).subscribe(res => {
          })
        }

      }
    }
  }

  refreshPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
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
  }
]
