import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

// import { ILoginResponce } from 'src/app/shared/interfaces/login-response.interface';
// import { IAccount } from 'src/app/shared/interfaces/account.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _currentUser$$ = new BehaviorSubject<any | null>(null);
  currentUser = this._currentUser$$.asObservable();
  currentUserId: any;
  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    public jwtService: JwtHelperService
  ) {}

  login(user: any): Observable<any> {
    console.log(environment.basePath, 'asdajnd lqihjwd');

    // return this.http.post<any>(`http://localhost:3000/api/user/login`, user).pipe(
    return this.http
      .post<any>(`${environment.basePath}/user/login`, user)
      .pipe(
        tap((res: any) => {
          this.currentUserId = this.jwtService.decodeToken(res.result.token);
          console.log('this.currentUserId', this.currentUserId);

          // this.currentUser.set(this.jwtService.decodeToken(res.token).user as IUser);
        }),
        tap(() =>
          this.snackbar.open('Login Successfull', 'Close', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          })
        )
      );
  }

  handleLogin(account: any) {
    this._currentUser$$.next(account);
  }

  handleLogout() {
    this._currentUser$$.next(null);
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token') || '';
  }

  appInitializer() {
    const token = localStorage.getItem('token');

    if (token) {
      const isTokenExpired = this.jwtService.isTokenExpired(token);

      if (!isTokenExpired) {
        const user = this.jwtService.decodeToken(token).user as any;
        this.handleLogin(user);

        return user;
      }
      this.handleLogout();
      localStorage.removeItem('token');

      return undefined;
    }

    return undefined;
  }

  extractUserIdFromToken(token: string): string | null {
    try {
      const decodedToken = this.jwtService.decodeToken(token);
      if (decodedToken && decodedToken.user && decodedToken.user._id) {
        return decodedToken.user._id;
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  public getTokenN() {
    return localStorage.getItem('token');
  }
}
