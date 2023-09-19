import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  hide = true;

  isLoading = false;
  
  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required])
  });
  isPasswordVisible: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    public dialog: MatDialog
  ) { }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  login() {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.login(this.form.value).subscribe({
        next: (res: any) => {
          console.log('res', res);
          this.isLoading = false;
          this.dialog.closeAll()
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.log(err);
          this.isLoading = false;
        }
      })
    }
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  updateData() {
    // setTimeout(() => {
    //   const updatedData = this.authService.authToken;
    //   this.authService.updateData(updatedData);
    //   console.log();
    //   localStorage.setItem("role", this.authService.authToken.user.role);
    // }, 1000)

  }

}
