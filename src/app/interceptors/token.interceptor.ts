import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { EMPTY, Observable} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable()
export class TokenIInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let req;
    if (request.url.endsWith("login") || request.url.endsWith("register")) {
      req = next.handle(request);
    } else {
      const authToken = this.authService.getToken();

      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });
      req = next.handle(authReq);
    }
    return req.pipe(catchError((error: HttpErrorResponse) => {
            console.error(error);
          
          return EMPTY;
        }));
  }
}