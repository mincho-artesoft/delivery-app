import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { CustomValidators } from '../../_helpers/custom-validators';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  addressForm!: FormArray;
  formRegister!: FormGroup;

  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    this.formRegister = this.formBuilder.group({
      id: new Date().valueOf().toString(),
      email: new FormControl(''),
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
      this.userService.create(this.formRegister.value).pipe(
        tap(() => this.router.navigate(['auth/login']))
      ).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.router.navigate(['/'])
          console.log(res)
        },
        error: (err: any) => {
          this.isLoading = false;
          console.log(err);
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
