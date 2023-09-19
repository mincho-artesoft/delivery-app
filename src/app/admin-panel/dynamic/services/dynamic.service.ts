import { CdkDropList } from '@angular/cdk/drag-drop';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { ADMIN_PANEL_SETTINGS } from '../../admin-panel-settings';

@Injectable({
  providedIn: 'root'
})
export class DynamicService {
  pathCreateForm = new BehaviorSubject<any>('');
  itemToDrop: any;
  dropLists: any = [];
  setRowId = signal('');
  currentRouteSignal = signal<any>('');
  formGroupProvider = signal<any>(ADMIN_PANEL_SETTINGS.pages[2]);
  formArrayProvider = signal<any>(ADMIN_PANEL_SETTINGS.pages[3]);
  lastSelectedRow: any;
  openSidenav = new BehaviorSubject(false);
  isSidenavOpen: boolean = false;
  private dataSource = new BehaviorSubject<any>({mainMenu: []});
  data = this.dataSource.asObservable();

  constructor(
    private location: Location,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private http: HttpClient) {
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
            // let url = this.interpolate(button.deletePath, control?.getRawValue() || this.lastSelectedRow)
            // this.http.delete(url).subscribe(res => {
            //   this.snackbar.open(message, 'Close', {
            //     duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            //   });
            // })

            const path = control?.getRawValue()._id;
            // this.http.delete(url).subscribe(res => {
            //   this.snackbar.open(message, 'Close', {
            //     duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            //   });
            // })
            const url = this.interpolate(button.deletePath, { ...control.getRawValue(), path});
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

        if (button.action === 'edit' && id) {
          const [param, b, c] = id.split(".");
          urlSegments.push(param, 'edit');
        } else if (button.action === 'create') {
          urlSegments.push('edit');
        }

        this.router.navigate(urlSegments);
      }
    } else {
      if (button.action === 'close') {
        this.toggleSidenav()
      } else if (button.action === 'save'){
        const id = control ? control.getRawValue()._id : this.lastSelectedRow?._id;
        //                   random id
        const path = id || `${this.generateRandomId(10)}.{userID}.organization`;

        this.http.request('Ypost', `?path=${path}`, { body: { data: control.getRawValue() } }).subscribe((res: string) => {
          const data = JSON.parse(res);
            this.snackbar.open(data.message, 'Close', {
              duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            });
            this.toggleSidenav()
            // this.currentRoute.set("");
        })
      }
    }
  }
}
