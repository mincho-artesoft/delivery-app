import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

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

  

  getUserById(id: any) {
    // http://localhost:3000/api/
    // return this.http.get(`https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/user/${id}`)\
    return this.http.get(`http://localhost:3000/api/user/${id}`);
  }

}
