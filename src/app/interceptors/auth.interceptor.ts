import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
// import { ILoginResponce } from 'src/app/shared/interfaces/login-response.interface';
// import { IAccount } from 'src/app/shared/interfaces/account.interface';
import { uuidv4 } from '@firebase/util';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  uuid = uuidv4();

  constructor(
    private authService: AuthService, 
    private jwtService: JwtHelperService, 
    ) {}


  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get the token from the AuthService
    const token = this.authService.getToken();
    
    if (token) {
      const userID = this.authService.extractUserIdFromToken(token)
      console.log(userID);
      
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${userID}`,
          "x-user-id": userID || "jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231"
        }
      });
    } else {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer asdasdasd`,
          "x-user-id": "jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231"
        }
      });
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          if (event.url?.endsWith('login')/* || event.url?.endsWith('register')*/) {
            const account = this.jwtService.decodeToken((event.body as any).result.token).user as any;
            localStorage.setItem('token', (event.body as any).result.token);
            console.log(account);
            this.authService.handleLogin(account);
          } else if (event.url?.endsWith('logout')) {
            this.authService.handleLogout();
          }
        }
      })
    );
  }
}
