import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../services/auth.service';
import { YjsService } from 'src/app/yjs.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  addressForm!: FormArray;
  formRegister!: FormGroup;

  isLoading = false;

  invitationToken = null;  

  constructor(
    private yjsService: YjsService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private jwtService: JwtHelperService,
    public formBuilder: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((res) => {
      const token = res['params'].token;
      this.invitationToken = this.jwtService.decodeToken(token);

      this.buildForm();
    });
  }

  private buildForm() {
    this.formRegister = this.formBuilder.group({
      id: new Date().valueOf().toString(),
      email: new FormControl(this.invitationToken?.email || ""),
      name: new FormControl(''),
      surName: new FormControl(''),
      lastName: new FormControl(''),
      password: new FormControl(''),
      addresses: this.formBuilder.array([
        this.createAddressGrop()
      ]),
      phoneNumber: new FormControl(''),
      // iAgree: new FormControl(''),
      roles: this.formBuilder.array([
        this.setRole()
      ])
    });
    this.addressForm = this.formRegister.get('addresses') as FormArray

  }
  get addresses() {
    return this.addressForm.controls
  }

  setRole(){
    return this.formBuilder.group({
      role: ['']
    })
  }

  createAddressGrop() {
    return this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zipCode: [Number],
      country: [''],
    })
  }

  addAddress() {
    const newAddress = this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zipCode: [Number],
      country: [''],
    })
    this.addressForm.push(newAddress)
  }

  register() {
    if(this.formRegister.valid) {
      this.isLoading = true;

      const documentRequest = this.invitationToken ? mergeMap((res: any) => {
        const user = this.jwtService.decodeToken(res.result.token);
        this.invitationToken = null;
        return this.authService.createYjsBackendDocument({ ...this.invitationToken, _id: user.user._id});
      }) : tap((res) => res);

      this.authService.register({...this.formRegister.value, roles: ["admin"]}).pipe(
        mergeMap((res) => {
          return this.authService.login(this.formRegister.value);
        }),
        documentRequest,
        mergeMap(() => {
          return this.yjsService.reconnect();
        }),
        catchError(e => {
          console.log(e);
          this.isLoading = false;
          this.snackbar.open(`User could not be created, due to: ${e.error.response.message}`, 'Close', {
            duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
          })
          return EMPTY;
        })
      ).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/']);
          console.log(res)
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
        }
      });
    }
  }
  safeGet(controlName: string) {
    const control = this.formRegister.get(controlName);
    if (control instanceof FormArray) {
      return control.controls;
    }
    return [];
  }
  

  goToLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '460px',
      // height: '90vh',
      hasBackdrop: true,
      // data: { file: result}
    });
  }

}
