import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar
  ) { }

  findByUsername(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.basePath}/api/users/find-by-username?username=${username}`);
  }

  create(user: any): Observable<any> {
    //  return this.http.post<IUser>(`https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/user/register`, user)
    return this.http.post<any>(`https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/user/register`, user, httpOptions).pipe(
      tap((createdUser) => this.snackbar.open(`User ${createdUser} created successfully`, 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      })),
      catchError(e => {
        this.snackbar.open(`User could not be created, due to: ${e.error.message}`, 'Close', {
          duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
        })
        return EMPTY;
      })
    )
  }

  getUserById(id: any) {
    return this.http.get(`https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/user/${id}`)
  }
}
