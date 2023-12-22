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
          const path = InterpolateService.suplant(button.yPost, values);
          console.log(path)
          this.http.request('Ypost', `${path}`, { body: { data: control.getRawValue() } }).subscribe((res: any) => {
            const data = JSON.parse(res);
            control.patchValue(data.data);
            this.snackbar.open(data.message, 'Close', {
              duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            });
            if (button.createServices) {
              // TODO Services hardcoded in different ts file
              [{ name: 'warehouse', value: 'base' }, { name: 'humanResources', value: 'hr-10' }].map(service => {
                this.http.request('Ypost', `/services?path=${data._id}`, { body: { service } }).subscribe((res: string) => {
                });
              });
            }
            // this.toggleSidenav()
            // this.currentRoute.set("");
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
    // Assuming you're refreshing the current route
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
